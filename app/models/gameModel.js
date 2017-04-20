const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameModel = new Schema({
    comp_id: {
        type: String,
        required: true
    },
    round: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0 // Options: 0, 1, 2, 3. Explained: not finished, p1 win, draw, p2 win
    },
    p1_id: {
        type: String,
        required: true
    },
    p1_color: {
        type: String,
        required: true,
        default: 0 // Options: 0, 1. Explained: white, black
    },
    p2_id: {
        type: String,
        required: true
    },
    p2_color: {
        type: String,
        required: true,
        default: 0 // Options: 0, 1. Explained: white, black
    }
});

module.exports = mongoose.model('gameModel', gameModel);
