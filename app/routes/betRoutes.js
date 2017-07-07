const express = require('express');
const router = express.Router();
const betModel = require('../models/betModel');

router.route('/bet')

	.put((request, res) => {
        
            betModel.find({'userId': request.body.userId, 'gameId': request.body.gameId}, {}, (err, bets) => {
            if (err) {
                return res.send(err);
            }
            res.json(bets);}).sort( { place_date: -1 } );
        
		
	})
    .post((request, res) => {
    	const bet = new betModel(request.body);
        bet.save((err, bets) => {
            if (err) {
                return res.send(err);
            }
            return res.send(bets);
        });
    });

router.route('/bet/:gameId')
    .get((request,res)=>{
        betModel.find({ 'gameId': request.params.gameId}, {}, (err, bets) => {
            if (err) {
                return res.send(err);
            }
            return res.send(bets);
        });
    })
    .put((request,res)=>{
        betModel.updateMany({ 'gameId': request.params.gameId}, {$set:{ 'result':request.body.status }}).then(()=>{
            betModel.find({ 'gameId': request.params.gameId, 'option':request.body.status}, {}, (err, bets) => {
            if (err) {
                return res.send(err);
            }
            return res.send(bets);
        });
        });

        
    });

router.route('/bet/user/:userId')
    .get((request,res)=>{
        betModel.find({'userId':request.params.userId},{},(err,bets)=>{
            if(err){
                return res.send(err);
            }
            return res.send(bets);
        })
    })

module.exports = router;