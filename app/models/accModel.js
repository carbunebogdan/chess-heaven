const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accModel = new Schema({
    username: {
        type: String,
        unique:true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: /\S+@\S+\.\S+/
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true,
        default: 0 // Options: 0, 1, 2. Explained: referee, gambler, player.
    },
    status: {
        type: Number,
        default: 0 // Options: 0, 1, 2. Explained: inactive, active, ingame.
    },
    money:{
        type: Number,
        default: 0
    },
    club:{
        type: String,
        default: null
    },
    wins:{
        type: Number,
        default: 0
    },
    loses:{
        type: Number,
        default: 0
    },
    join_date: {
        type: Date,
        required: true,
        default: new Date().getTime()
    },
    usable:{
        type: Number,
        default: 0 // Options: 0,1. Explained: not activated, activated.
    },
    sockId:{
        type: String,
        default: null //temporary socket connection id
    }
});

module.exports = mongoose.model('accModel', accModel);
