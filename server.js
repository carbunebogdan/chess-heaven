'use strict';

// Module dependencies.
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

// Set views path, template engine and default layout
app.use('/lib', serveStatic(path.normalize(__dirname) + '/bower_components'));
app.use(serveStatic(path.normalize(__dirname) + '/public'));

// add request body data under ".body"
app.use(bodyParser.json());

// Add routes in the application
require('./app/routes/index')(app);

// Default route 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});
app.set('port', (process.env.PORT || 5000));
// Start the app by listening on 3000
const server = app.listen(app.get('port'), function() {
    console.log('Chess Heaven opened the gates on port ' + app.get('port'));
});

const io = require('socket.io')(server);

var currentRoom=null;
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

var getGameByPlayerId = (id,socket)=>{
	gameModel.find({$or: [ { p1_id: id }, { p2_id: id } ]},{_id:1,room:1},(err,game)=>{
		if(err){
			console.log(err);
		}else{
			socket.join(game[0].room);
			currentRoom=game[0].room;
			socket.broadcast.to(currentRoom).emit('newMessage', {
            	source: {
            		sender:'master',
                	message:'The enemy has returned!'}
        	});
        	socket.emit('gameId',game[0]._id);
		}
	}).sort({date: -1}).limit(1);
}



io.on('connection', (socket) => {
    console.log('The socket is on!');

    // when I leave the game I must announce the other player
    socket.on('leftGame',(from)=>{
    	socket.broadcast.to(currentRoom).emit('leftGame',1);
    	socket.leave(currentRoom);
    	socket.broadcast.emit('updateList', {
                                source: {
                                    user: from,
                                    status: 1,
                                    sockId: socket.id
                                }
                            });
    })

    socket.on('leaveRoom',(from)=>{
    	socket.leave(currentRoom);
    	socket.broadcast.emit('updateList', {
                                source: {
                                    user: from,
                                    status: 1,
                                    sockId: socket.id
                                }
                            });
    })

    //Joining a game
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
                        sockId: null
                    }
                });
            }

        });

    });

    socket.on('I was in a game',(from)=>{
    	getGameByPlayerId(from.id,socket);
    })

    socket.on('disconnect', (from) => {
    	var sockId=socket.id;
        accModel.find({ 'sockId': sockId }, { status: 1 }, (err, account) => {
            if (err) {
                console.log(err);
            }
            if (account[0]) {
                if (account[0].status == 2) {
                    console.log('bitch was in a game');
                } else {
                    accModel.findOneAndUpdate({ 'sockId': sockId }, { $set: { 'status': 0, 'sockId': null } }, { new: true }, (error, acc) => {
                        if (error) {
                            console.log(error);
                        } else {
                            socket.broadcast.emit('updateList', {
                                source: {
                                    user: acc.username,
                                    status: 0,
                                    sockId: null
                                }
                            });
                        }

                    });
                }

            }

        })
    });

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
                            sockId: null
                        }
                    });
                }

            });

            const compObj = {
                name: from.p2 + ' vs ' + from.p1,
                rounds: 1
            };
            const comp = new compModel(compObj);
            comp.save((err, competitions) => {
                if (err) {
                    console.log(err);
                }else{
                	const gameObj={
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
		            game.save((error,game)=>{
		            	if(error){
		            		console.log(error);
		            	}else{
		            		from.game_Id=game._id;
		            		socket.broadcast.emit('newCompetition', 1);
		            		socket.broadcast.to(from.sockId).emit('challengeResponse', {
				            	source: from
				        	});
		            	}
		            });
	                }

            });

            

        }else{
        	socket.broadcast.to(from.sockId).emit('challengeResponse', {
            source: from
        	})
        }

        

    });


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

    // When we recieve that a new competition was added send back so we update all opened applications
    socket.on('newCompetition', (from) => {

        socket.broadcast.emit('newCompetition', {
            source: from
        });
    });

    //Update all opened applications with the latest bets, and update account money
    socket.on('newBet', (from) => {

        socket.broadcast.emit('newBet', {
            source: from
        });
    });

    //Update all opened applications with the new money ammount
    socket.on('updateMoney', (from) => {

        socket.broadcast.emit('updateMoney', {
            source: from
        });
    });
});

// Expose app
exports = module.exports = app;
