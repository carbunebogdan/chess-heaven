const express = require('express');
const router = express.Router();
const gameModel = require('../models/gameModel');
const compModel = require('../models/compModel');

router.route('/game')
	.get((request, res) => {
		gameModel.find({}, {}, (err, games) => {
			if (err) {
				return res.send(err);
			}
			res.json(games);
		});
	})
    .post((request, res) => {
    	const game = new gameModel(request.body);
        game.save((err, games) => {
            if (err) {
                return res.send(err);
            }
            return res.send(games);
        });
    })
    .put((request, res) => {
        gameModel.findOneAndUpdate({ _id: request.body.id }, { $set: request.body }, (err, games) => {
            if (err) {
                return res.send(err);
            }
            
            // Update the competition with the correct data when games are ending
            gameModel.find({ 'comp_id': request.body.comp_id, 'round': request.body.round, 'status': 0}, {}, (err, games) => {
                if (games.length === 0) {
                    compModel.findOne({ _id: request.body.comp_id}, {}, (err, competition) => {
                    if(competition){
                        if (competition.current_round < competition.rounds) {
                            competition.current_round = competition.current_round + 1;
                        } else if (competition.current_round === competition.rounds) {
                            competition.status = 1;
                        }
                        compModel.findOneAndUpdate({ _id: competition._id }, { $set: competition }, (err, comps) => {
                            console.log('We have update the competition');
                        });
                    }
                    });
                }
            });
            if(games){
                return gameModel.findOne({ '_id': games._id}, {}, (err, games) => {
                if (err) {
                    return res.send(err);
                }
                return res.send(games);
            });
            }
            
        });
    });

router.route('/game/:id')
	.get((request, res) => {
		gameModel.find({ 'comp_id': request.params.id}, {}, (err, games) => {
            if (err) {
                return res.send(err);
            }
            return res.send(games);
        });
	});

router.route('/gameById/:id')
    .get((request,res)=>{
        gameModel.findById(request.params.id,(err, game)=>{
            if(err){
                return res.send(err);
            }
            return res.send(game);
        });
    });

module.exports = router;