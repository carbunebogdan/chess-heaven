'use strict';

// module dependencies.
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serveStatic = require('serve-static');
const db = require('./app/connection');
const app = express();
const port = 3000;
const accModel = require('./app/models/accModel');
const compModel = require('./app/models/compModel');
const gameModel = require('./app/models/gameModel');
const generate = require('./app/game_logic/generateGames');

// set views path, template engine and default layout
app.use('/lib', serveStatic(path.normalize(__dirname) + '/bower_components'));
app.use(serveStatic(path.normalize(__dirname) + '/public'));

// add request body data under ".body"
app.use(bodyParser.json());

// add routes in the application
require('./app/routes/index')(app);

// default route 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});
app.set('port', (process.env.PORT || 5000));
// start the app by listening on 3000
const server = app.listen(app.get('port'), ()=>{
    console.log('Chess Heaven opened the gates on port ' + app.get('port'));
});

const io = require('socket.io')(server);






io.on('connection', (socket) => {
    // find the user and update it's database status
    var statusAndsockId = (user, status, sockId) => {
        if (status == 0) {
            accModel.findOneAndUpdate({ 'username': user }, { $set: { 'status': status, 'sockId': null } }, { new: true }, (err, account) => {
                if (err) {
                    console.log(err);
                }


            });
        } else {
            accModel.findOneAndUpdate({ 'username': user }, { $set: { 'status': status, 'sockId': sockId } }, { new: true }, (err, account) => {
                if (err) {
                    console.log(err);
                }


            });
        };

    }

    // get game by player id, retrieve required infos so I can get back to my game, also ask for game data to place chess pieces and initiate game instance
    var getGameByPlayerId = (id, socket) => {
        gameModel.find({ $or: [{ p1_id: id }, { p2_id: id }] }, { _id: 1, room: 1 }, (err, game) => {
            if (err) {
                console.log(err);
            } else {
                socket.join(game[0].room);
                currentRoom = game[0].room;
                socket.broadcast.to(currentRoom).emit('newMessage', {
                    source: {
                        sender: 'master',
                        message: 'The enemy has returned!'
                    }
                });
                socket.broadcast.to(currentRoom).emit('needData', 1);
                socket.emit('gameId', game[0]._id);
            }
        }).sort({ date: -1 }).limit(1);
    }
    var currentRoom = null;
    console.log('The socket is on!');

    // update list and leave current room when the game is over
    socket.on('endGame', (from) => {
        socket.leave(currentRoom);
        socket.broadcast.emit('updateList', {
            source: {
                user: from.user,
                status: 1,
                sockId: socket.id,
                wins:from.wins,
                loses:from.loses
            }
        });
    })

    socket.on('error', () => {
        console.log('socket error');
    })

    // 
    socket.on('gameData', (from) => {
        socket.broadcast.to(currentRoom).emit('gameData', from);
    })

    // send move to other player
    socket.on('move', (from) => {
        socket.broadcast.to(currentRoom).emit('move', from);
    });

    // announce the other player, leave current room and update list
    socket.on('leftGame', (from) => {
        socket.broadcast.to(currentRoom).emit('leftGame', 1);
        socket.leave(currentRoom);
        socket.broadcast.emit('updateList', {
            source: {
                user: from.user,
                status: 1,
                sockId: socket.id,
                wins: from.wins,
                loses: from.loses
            }
        });
    })

    // leave current room and update list when I'm announced that the other player has left
    socket.on('leaveRoom', (from) => {
        socket.leave(currentRoom);
        socket.broadcast.emit('updateList', {
            source: {
                user: from.user,
                status: 1,
                sockId: socket.id,
                wins:from.wins,
                loses:from.loses
            }
        });
    })

    // joining a game
    socket.on('joinGame', (from) => {
        socket.room = from.room;
        socket.join(socket.room);
        socket.broadcast.to(socket.room).emit('enterGame', {
            source: from.game_Id
        });
        currentRoom = socket.room;
        accModel.findOneAndUpdate({ 'sockId': socket.id }, { $set: { 'status': 2 } }, { new: true }, (err, account) => {
            if (err) {
                console.log(err);
            }
            if (account) {
                socket.broadcast.emit('updateList', {
                    source: {
                        user: account.username,
                        status: 2,
                        sockId: null,
                        wins:account.wins,
                        loses:account.loses
                    }
                });
            }

        });

    });

    // if I was in a game I need to get back
    socket.on('I was in a game', (from) => {
        getGameByPlayerId(from.id, socket);
    })

    // in case of an unexpected disconnection change my status from database and update list, if I was in a game, announce my leave to the other player and let the database status untouched
    socket.on('disconnect', (from) => {
        var sockId = socket.id;
        currentRoom = socket.room;
        io.in(currentRoom).emit('player left', 1);
        accModel.find({ 'sockId': sockId }, { status: 1 }, (err, account) => {
            if (err) {
                console.log(err);
            }
            if (account[0]) {
                if (account[0].status == 2) {

                } else {
                    accModel.findOneAndUpdate({ 'sockId': sockId }, { $set: { 'status': 0, 'sockId': null } }, { new: true }, (error, acc) => {
                        if (error) {
                            console.log(error);
                        } else {
                            if (acc) {
                                socket.broadcast.emit('updateList', {
                                    source: {
                                        user: acc.username,
                                        status: 0,
                                        sockId: null,
                                        wins: acc.wins,
                                        loses: acc.loses
                                    }
                                });
                            }

                        }

                    });
                }

            }

        })
    });

    // analyze the response, if it's a "yes" then prepare the game and join a new socket room also update my database status and update list 
    socket.on('challengeResponse', (from) => {


        if (from.response == 1) {
            socket.room = from.p2 + 'vs' + from.p1;
            socket.join(socket.room);
            currentRoom = socket.room;
            accModel.findOneAndUpdate({ 'sockId': socket.id }, { $set: { 'status': 2 } }, { new: true }, (err, account) => {
                if (err) {
                    console.log(err);
                }
                if (account) {
                    socket.broadcast.emit('updateList', {
                        source: {
                            user: account.username,
                            status: 2,
                            sockId: null,
                            wins:account.wins,
                            loses:account.loses
                        }
                    });
                }

            });

            // create 1 vs 1 single round competition
            const compObj = {
                name: from.p2 + ' vs ' + from.p1,
                rounds: 1
            };
            const comp = new compModel(compObj);
            comp.save((err, competitions) => {
                if (err) {
                    console.log(err);
                } else {
                    const gameObj = {
                        comp_id: competitions._id,
                        round: 1,
                        status: 0,
                        p1_id: from.p1_id,
                        p1_color: 0,
                        p2_id: from.p2_id,
                        p2_color: 1,
                        room: socket.room

                    };

                    const game = new gameModel(gameObj);
                    game.save((error, game) => {
                        if (error) {
                            console.log(error);
                        } else {
                            from.game_Id = game._id;
                            socket.broadcast.emit('newCompetition', 1);
                            socket.broadcast.to(from.sockId).emit('challengeResponse', {
                                source: from
                            });
                        }
                    });
                }

            });



        } else {
            socket.broadcast.to(from.sockId).emit('challengeResponse', {
                source: from
            })
        }



    });

    // send the challenge to the desired player
    socket.on('challenge', (from) => {
        from.p1_sockId = socket.id;
        socket.broadcast.to(from.sockId).emit('challenge', {
            source: from
        })
    })

    // new player status, need to update the table
    socket.on('updateList', (from) => {
        if (from.status == 0) {
            from.sockId = null;
        } else {
            from.sockId = socket.id;
        }

        statusAndsockId(from.user, from.status, from.sockId);
        socket.broadcast.emit('updateList', {
            source: from
        });
    })

    // new message
    socket.on('newMessage', (from) => {
        socket.broadcast.to(currentRoom).emit('newMessage', {
            source: from
        });
    });

    // when we recieve that a new competition was added send back so we update all opened applications
    socket.on('newCompetition', (from) => {

        socket.broadcast.emit('newCompetition', {
            source: from
        });
    });

    // update all opened applications with the latest bets, and update account money
    socket.on('newBet', (from) => {

        socket.broadcast.emit('newBet', {
            source: from
        });
    });

    // update all opened applications with the new money ammount
    socket.on('updateMoney', (from) => {

        socket.broadcast.emit('updateMoney', {
            source: from
        });
    });
});

// expose app
exports = module.exports = app;