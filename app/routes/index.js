const express = require('express');
const router = express.Router();
const player = require('./playerRoutes');
const competition = require('./compRoutes');
const game = require('./gameRoutes');
const account= require('./accRoutes');
const bet= require('./betRoutes');

module.exports = (app) => {

	// Handle for the account routes
    router.use('/', account);

    // Handle for the player routes
    router.use('/', player);

    // Handle for the competition routes
    router.use('/', competition);

    // Handle for the game routes
    router.use('/', game);

    // Handle for the bet routes
    router.use('/', bet);

    // Expose them to the rest of the application
    app.use('/', router);

}
