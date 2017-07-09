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

var statusAndsockId=(user,status,sockId)=>{
	if(status==0){
		accModel.findOneAndUpdate(
            { 'username': user },
            { $set: { 'status':status, 'sockId': null } },
            { new:true }, (err, account) => {
            if (err) {
                console.log(err);
            }
            
            
        });
	}else{
		accModel.findOneAndUpdate(
            { 'username': user },
            { $set: { 'status':status, 'sockId': sockId } },
            { new:true }, (err, account) => {
            if (err) {
                console.log(err);
            }
            
            
        });
	};
	
}



io.on('connection',(socket)=>{
	console.log('The socket is on!');
	var currentRoom=null;
	//Joining a game
	socket.on('joinGame',(from)=>{
		socket.room=from;
		socket.join(socket.room);
		socket.broadcast.to(socket.room).emit('roomTest',{
			source:'here I am'
		});
		currentRoom=socket.room;
		accModel.findOneAndUpdate(
            { 'sockId': socket.id },
            { $set: { 'status':2 } },
            { new:true }, (err, account) => {
            if (err) {
                console.log(err);
            }
            if(account){
	            socket.broadcast.emit('updateList',{
					source:{
						user:account.username,
						status:2,
						sockId:null
					}
				});	
            }
            
        });

	});

	socket.on('disconnect',(from)=>{
			accModel.findOneAndUpdate(
            { 'sockId': socket.id },
            { $set: { 'status':0, 'sockId': null } },
            { new:true }, (err, account) => {
            if (err) {
                console.log(err);
            }
            if(account){
	            socket.broadcast.emit('updateList',{
					source:{
						user:account.username,
						status:0,
						sockId:null
					}
				});	
            }
            
        });
	})

	socket.on('challengeResponse',(from)=>{

		socket.broadcast.to(from.sockId).emit('challengeResponse',{
			source:from
		})

		if(from.response==1){
			socket.room=from.user+'vs'+from.challenger;
			socket.join(socket.room);
			currentRoom=socket.room;
			accModel.findOneAndUpdate(
	            { 'sockId': socket.id },
	            { $set: { 'status':2 } },
	            { new:true }, (err, account) => {
	            if (err) {
	                console.log(err);
	            }
	            if(account){
		            socket.broadcast.emit('updateList',{
						source:{
							user:account.username,
							status:2,
							sockId:null
						}
					});	
	            }
            
        	});

        const compObj = {
            name: from.user+' vs '+from.challenger,
            rounds: 1
        };
        const comp = new compModel(compObj);
        comp.save((err, competitions) => {
            if (err) {
                return res.send(err);
            }

            const compId = competitions._id;
            const generatedGames = generate.generateGames(compId, [from.p1_id,from.p2_id]);
            if (generatedGames) {
                return gameModel.create(generatedGames, (err, data) => {
                    if (err) {
                        console.log(err);
                    }
                    socket.broadcast.emit('newCompetition', {
						source: from
					});
                });
            }
            console.log('Something went wrong!');
        });

		}
		
	})


	socket.on('challenge',(from)=>{
		from.challengerId=socket.id;
		socket.broadcast.to(from.sockId).emit('challenge',{
			source:from
		})
	})

	// new player status, need to update the table
	socket.on('updateList',(from)=>{
		if(from.status==0){
			from.sockId=null;
		}else{
			from.sockId=socket.id;
		}
		

		statusAndsockId(from.user,from.status,from.sockId);
		socket.broadcast.emit('updateList',{
			source:from
		});
	})

	// new message
	socket.on('newMessage', (from)=>{
		socket.broadcast.to(currentRoom).emit('newMessage', {
			source: from
		});
	});

	// When we recieve that a new competition was added send back so we update all opened applications
	socket.on('newCompetition', (from)=>{

		socket.broadcast.emit('newCompetition', {
			source: from
		});
	});

	//Update all opened applications with the latest bets, and update account money
	socket.on('newBet', (from)=>{
		
		socket.broadcast.emit('newBet', {
			source: from
		});
	});

	//Update all opened applications with the new money ammount
	socket.on('updateMoney', (from)=>{
		
		socket.broadcast.emit('updateMoney', {
			source: from
		});
	});
});

// Expose app
exports = module.exports = app;