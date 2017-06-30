'use strict';

const mongoose = require('mongoose');
const db = mongoose.connect('mongodb://bogdan:parola@ds113841.mlab.com:13841/chess-heaven'); 

// Attach lister to connected event
mongoose.connection.once('connected', () => {
	console.log('Connected to database');
});

// Expose the db connection
module.exports = db;