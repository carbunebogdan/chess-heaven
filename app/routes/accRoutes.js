const express = require('express');
const router = express.Router();
const accModel = require('../models/accModel');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cryptAlgorithm = 'aes-256-ctr';
const key = 'd6F3Efeq';

var encrypt=(password)=>{
    var cipher = crypto.createCipher(cryptAlgorithm,key)
    var crypted = cipher.update(password,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
};

var decrypt=(crypted)=>{
    var decipher = crypto.createDecipher(cryptAlgorithm,key)
    var dec = decipher.update(crypted,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

console.log(decrypt('0786d18332797d71264cea5ca5c31b96b24688fad3e8d0'));

router.route('/acc')
	.get((request, res) => {
            accModel.find({}, {username:1,type:1,join_date:1}, (err, accounts) => {
            if (err) {
                return res.send(err);
            }
            res.json(accounts);}).limit(5).sort( { join_date: -1 } );

            
        
		
	})
    .post((request, res) => {
    	var account = new accModel(request.body);
        account.password=encrypt(account.password);
        var code=Math.floor(Math.random()*(9999-1000+1)+1000).toString();
        var canInsert=true;
            accModel.count({'username': request.body.username},(err,count)=>{
            if(!count){
                account.save((err, accounts) => {
                if (err) {
                    console.log(err);
                }
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: decrypt('0786d18332797d71264cea5ca5c31b96b24688fad3e8d0'),
                    pass: decrypt('0583c491337e7471')
                  }
                });

                var mailOptions = {
                  from: decrypt('0786d18332797d71264cea5ca5c31b96b24688fad3e8d0'),
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
                return res.send("bad");
            }
        });

        
        
        
    })
    .put((request, res) => {
        var password=encrypt(request.body.password);
        if(request.body.status==1){
            accModel.findOneAndUpdate(
            { 'username': request.body.username, 'password': password },
            { $set: { 'status':request.body.status } },
            { returnNewDocument:true }, (err, account) => {
            if (err) {
                return res.send(err);
            }
            return res.send(account);
                    
            
            });
        }else{
            accModel.findOneAndUpdate(
            { 'username': request.body.username},
            { $set: { 'status':request.body.status } },
            { returnNewDocument:true }, (err, account) => {
            if (err) {
                return res.send(err);
            }
            return res.send(account);
                    
            
            });
        }
        
    });

router.route('/acc/:user')
    .get((request, res) => {
        accModel.findOne({ 'username': request.params.user}, {wins:1,loses:1}, (err, acc) => {
            if (err) {
                return res.send(err);
            }
            return res.send(acc);
        });
    })
    .put((request,res)=>{
        accModel.findOneAndUpdate(
            { 'username': request.params.user },
            { $set: { 'club':request.body.club } },
            { new:true }, (err, account) => {
            if (err) {
                return res.send(err);
            }
            return res.send(account);
            
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
                    user: decrypt('0786d18332797d71264cea5ca5c31b96b24688fad3e8d0'),
                    pass: decrypt('0583c491337e7471')
                  }
                });

        var mailOptions = {
                  from: decrypt('0786d18332797d71264cea5ca5c31b96b24688fad3e8d0'),
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
        accModel.find({'type':2}, {username:1,status:1,sockId:1,wins:1,loses:1}, (err, accounts) => {
            if (err) {
                return res.send(err);
            }
            res.json(accounts);}).sort( { join_date: -1 } );
    })
    .put((request,res)=>{
        accModel.findOneAndUpdate({'_id': request.body.id},{$set:{'status':request.body.status}},(err,players)=>{
            if(err){
                return res.send(err);
            }
           return res.send('success');
        })
    })
router.route('/players/:id')
    .get((request,res)=>{
        accModel.find({'_id':request.params.id},{},(err,player)=>{
            if (err) {
                return res.send(err);
                
            }
            res.json(player);
        })
    });
router.route('/club/:club')
    .get((request,res)=>{
        accModel.find({'club':request.params.club},{username:1,status:1,wins:1,loses:1},(err,players)=>{
            if(err){
                return res.send(err);
            }
            res.json(players);
        });
    })

module.exports = router;