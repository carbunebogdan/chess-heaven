const express = require('express');
const router = express.Router();
const accModel = require('../models/accModel');

router.route('/acc')
	.get((request, res) => {
        
            accModel.find({}, {}, (err, accounts) => {
            if (err) {
                return res.send(err);
            }
            res.json(accounts);}).limit(5).sort( { join_date: -1 } );
        
		
	})
    .post((request, res) => {
    	const account = new accModel(request.body);
        account.save((err, accounts) => {
            if (err) {
                return res.send(err);
            }
            return res.send(accounts);
        });
    })
    .put((request, res) => {
        accModel.findOneAndUpdate(
            { 'username': request.body.username, 'password': request.body.password },
            { $set: { 'status':request.body.status } },
            { returnNewDocument:true }, (err, account) => {
            if (err) {
                return res.send(err);
            }
            return res.send(account);
            
        });
    });

router.route('/acc/:user')
    .get((request, res) => {
        accModel.findOne({ 'username': request.params.user}, {}, (err, acc) => {
            if (err) {
                return res.send(err);
            }
            return res.send(acc);
        });
    });

router.route('/accmoney')
    .put((request, res) => {
        
        accModel.findOneAndUpdate(
            { '_id': request.body.user },
            { $inc: { 'money':request.body.ammount } },
            { new:true }, (err, account) => {
            if (err) {
                return res.send(err);
            }
            return res.send(account);
            
        });
    });

module.exports = router;