'use strict';

// Module dependencies.
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serveStatic = require('serve-static');
const db = require('./app/connection');
const app = express();
const port = 3000;

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

// Start the app by listening on 3000
const server = app.listen(port, function() {
    console.log('Chess Heaven opened the gates on port ' + port);
});

const io = require('socket.io')(server);

io.on('connection', function (socket) {
	console.log('The socket is on!');

	// When we recieve that a new competition was added send back so we update all opened applications
	socket.on('newCompetition', function (from) {

		socket.broadcast.emit('newCompetition', {
			source: from
		});
	});

	//Update all opened applications with the latest bets, and update account money
	socket.on('newBet', function (from) {
		
		socket.broadcast.emit('newBet', {
			source: from
		});
	});

	//Update all opened applications with the new money ammount
	socket.on('updateMoney', function (from) {
		
		socket.broadcast.emit('updateMoney', {
			source: from
		});
	});
});

// Expose app
exports = module.exports = app;