const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accModel = new Schema({
    username: {
        type: String,
        required: true,
        default: 1,
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true,
        default: 0 // Options: 0, 1. Explained: referee,gambler
    },
    status: {
        type: Number,
        default: 0 // Options: 0,1. Explained: inactive,active.
    },
    money:{
        type: Number,
        default: 0
    },
    join_date: {
        type: Date,
        required: true,
        default: new Date().getTime()
    }
});

module.exports = mongoose.model('accModel', accModel);
