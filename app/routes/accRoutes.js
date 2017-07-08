const express = require('express');
const router = express.Router();
const accModel = require('../models/accModel');
var nodemailer = require('nodemailer');

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
        var code=Math.floor(Math.random()*(9999-1000+1)+1000).toString();
        var canInsert=true;;
        accModel.count({'username': request.body.username},(err,count)=>{
            if(!count){
                console.log('good user');
                account.save((err, accounts) => {
                if (err) {
                    console.log(err);
                }
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: 'chessheaven17@gmail.com',
                    pass: 'amparola'
                  }
                });

                var mailOptions = {
                  from: 'chessheaven17@gmail.com',
                  to: request.body.email,
                  subject: 'Chess Heaven Registration Code',
                  text: 'Hello there ! Here is your code: '+ code
                };

                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    return res.send(code);
                  }
                });
                
            });
            }else{
                console.log('bad user');
                return res.send("bad");
            }
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
router.route('/activate')
    .put((request, res)=>{
        accModel.findOneAndUpdate(
            { 'username': request.body.username },
            { $inc: { 'usable':1 } },
            { new:true }, (err, account) => {
            if (err) {
                return res.send(err);
            }
            return res.send(account);
            
        });
    })
    .post((request, res)=>{
        var code=Math.floor(Math.random()*(9999-1000+1)+1000).toString();
        var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: 'chessheaven17@gmail.com',
                    pass: 'amparola'
                  }
                });

        var mailOptions = {
                  from: 'chessheaven17@gmail.com',
                  to: request.body.email,
                  subject: 'Chess Heaven Registration Code',
                  text: 'Hello '+ request.body.username +'! Here is your resent code: '+ code
                };

        transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    return res.send(code);
                  }
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
router.route('/players')
    .post((request,res)=>{
        accModel.find({'type':2,'username':{$ne: request.body.username}}, {username:1,status:1,sockId:1}, (err, accounts) => {
            if (err) {
                return res.send(err);
            }
            res.json(accounts);}).sort( { join_date: -1 } );
    });


module.exports = router;