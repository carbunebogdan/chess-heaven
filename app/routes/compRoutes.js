const express = require('express');
const router = express.Router();
const compModel = require('../models/compModel');
const gameModel = require('../models/gameModel');
const generate = require('../game_logic/generateGames');

router.route('/competition')
    .get((request, res) => {
        compModel.find({}, {}, (err, competitions) => {
            if (err) {
                return res.send(err);
            }
            res.send(competitions);
        });
    })
    .post((request, res) => {

        // Checks before adding a game
        if (!request.body.players || request.body.players.length % 2 !== 0) {
            res.send('We need players to generate a competition.');
            return;
        }
        const compObj = {
            name: request.body.name,
            rounds: request.body.players.length - 1
        };
        const comp = new compModel(compObj);
        comp.save((err, competitions) => {
            if (err) {
                return res.send(err);
            }

            const compId = competitions._id;
            const generatedGames = generate.generateGames(compId, request.body.players);
            if (generatedGames) {
                return gameModel.create(generatedGames, (err, data) => {
                    if (err) {
                        return res.send(err);
                    }
                    return res.send(data);
                });
            }
            return res.send('Something went wrong!');
        });
    })
    .delete((request, res) => {
        compModel.remove({ _id: request.body._id }, (err, competitions) => {
            if (err) {
                return res.send(err);
            }   

            return gameModel.remove({ comp_id: request.body._id }, (err, games) => {
                if (err) {
                    return res.send(err);
                }
                return res.send('Competition with assigned games, deleted!');
            });
        });
    })
    .put((request, res) => {
        compModel.findOneAndUpdate({ _id: req.body._id }, { $set: request.body }, (err, competitions) => {
            if (err) {
                return res.send(err);
            }
            res.send(competitions);
        });
    });
    
module.exports = router;