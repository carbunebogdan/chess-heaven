const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const compModel = new Schema({
    current_round: {
        type: Number,
        required: true,
        default: 1,
    },
    rounds: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0 // Options: 0, 1. Explained: not finished, finished
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: new Date().getTime()
    }
});

module.exports = mongoose.model('compModel', compModel);
