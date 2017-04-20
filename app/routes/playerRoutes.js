const express = require('express');
const router = express.Router();
const playerModel = require('../models/playerModel');

router.route('/player')
    .get((request, res) => {
        playerModel.find({}, {}, (err, players) => {
            if (err) {
                return res.send(err);
            }
            return res.send(players);
        });
    })
    .post((request, res) => {
        const player = new playerModel(request.body);
        player.save((err, player) => {
            if (err) {
                return res.send(err);
            }
            return res.send(player);
        });
    })
    .delete((request, res) => {
        playerModel.remove({ _id: request.body._id }, (err, players) => {
            if (err) {
                return res.send(err);
            }
            return res.send(players);
        });
    })
    .put((request, res) => {
        playerModel.findOneAndUpdate({ _id: request.body._id }, { $set: request.body }, (err, players) => {
            if (err) {
                return res.send(err);
            }
            return res.send(players);
        })
    });

// Expose the player routes
module.exports = router;
