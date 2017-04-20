const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const betModel = new Schema({
    gameId: {
        type: String,
        required: true
    },
    money: {
        type: Number,
        required: true
    },
    option: {
        type: Number,
        required: true
    },
    result: {
        type: Number,
        required:true,
        default: 0 // Options: 0,1,2,3. Explained: unfinished,p1 won, draw, p2 won.
    },
    userId: {
        type: String,
        required: true
    },
    place_date: {
        type: Date,
        required: true,
        default: new Date().getTime()
    }
});

module.exports = mongoose.model('betModel', betModel);
