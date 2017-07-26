'use strict';

const mongoose = require('mongoose');
require('dotenv').config();
const db = mongoose.connect(process.env.DB); 

// Attach lister to connected event
mongoose.connection.once('connected', () => {
	console.log('Connected to database');
});

// Expose the db connection
module.exports = db;