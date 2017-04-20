'use strict';

const mongoose = require('mongoose');
const db = mongoose.connect('mongodb://127.0.0.1:27017/'); 

// Attach lister to connected event
mongoose.connection.once('connected', () => {
	console.log('Connected to database');
});

// Expose the db connection
module.exports = db;