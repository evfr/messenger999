'use strict';

var User = require('../models/user');
var Message = require('../models/message');
var auth = require('./authenticate'); // get our config file


(function initUsers(){

    // var arr = [{ name: 'User1FN', lastName: 'User1LN', password: 'User1' }, 
    //     { name: 'User2FN', lastName: 'User2LN', password: 'User2' },
    //     { name: 'User3FN', lastName: 'User3LN', password: 'User3' },
    //     { name: 'User4FN', lastName: 'User4LN', password: 'User4' },
    //     { name: 'User5FN', lastName: 'User5LN', password: 'User5' }
    // ];
    // User.insertMany(arr, function(error, docs) {
    //     console.log('aaa');
    // });

    User.find(function(error, docs) {
        console.log(docs.length);
    });

})();

module.exports = function(app){
    //GET /getAllUsers
    app.get('/users/allUsers', function (req, res) {
        var authRes = auth.verifyToken(req, function (authRes){
            if (authRes.success){
                User.find({}, (err, foundUsers) => {
                    if (err) {
                        console.warn(err.message);
                        return res.status(500).send(err.message);
                    }
                    else {
                        return res.status(200).json({
                            success: true,
                            message: 'Authenticated',
                            users: foundUsers
                        });
                    }
                });
            }
            else{
                return res.status(403).send('access denied');
            }
        });
    });

    //POST /logon
    app.post('/logon', function(req, res) {
        auth.authenticate(req, function(authRes){
            if (!authRes.token) {
                console.warn(authRes.message);
                res.status(500).send(authRes.message);
            }
            else {
                res.cookie('_token', { token: authRes.token }, { expires: new Date(Date.now() + (86400000 * 10)) });
                return res.status(200).send("logged on");
            }            
        });
    });

    //POST /sendMessage
    app.post('/messenger/sendMessage',function (req, res) {
        var authRes = auth.verifyToken(req, function (authRes){
            if (authRes.success){
                let data = {sender: authRes.payload.id, receiver: req.body.receiver, message: req.body.message, subject: req.body.subject};
                let message = new Message(data);
                message.save(function (err) {
                    if (err) {
                        console.warn(err.message);
                        res.status(500).send(err.message);
                    }
                    else {
                        res.status(200).json({
                            success: true,
                            message: 'message sent'
                        }).send();
                    }
                })
            }
            else{
                return res.status(403).send('access denied');
            }
        });
    });

    //GET /getUserMessages
    app.get('/messenger/getUserMessages', function (req, res) {
        var authRes = auth.verifyToken(req, function (authRes){
            if (authRes.success){
                let filter = { $or : [ { sender : authRes.payload.id }, {receiver: authRes.payload.id } ] };
                if (req.query.unread){
                    // filter = {$and : [
                    //     filter,
                    //     { read : true }
                    // ]
                    filter.read = {$ne: true};
                }
                Message.find(filter).sort('createdAt').exec((err, foundMessages) => {
                    if (err) {
                        console.warn(err.message);
                        res.status(500).send(err.message);
                    }
                    else {
                        res.status(200).json({
                            success: true,
                            messages: foundMessages
                        }).send();
                    }
                });
            }
            else{
                return res.status(403).send('access denied');
            }
        });
    });

    //GET /getMessage
    app.get('/messenger/getMessage', function (req, res) {
        var authRes = auth.verifyToken(req, function (authRes){
            if (authRes.success){
                Message.findById( req.query.messageId, (err, foundMessage) => {
                    if (err) {
                        console.warn(err.message);
                        res.status(500).send(err.message);
                    }
                    else {
                        res.status(200).json({
                            success: true,
                            message: foundMessage
                        }).send();
                        //set message as read
                        if (!foundMessage.read){
                            foundMessage.read = true;
                            foundMessage.save(function(err) {
                                if(err) {
                                    console.log(err.message);
                                }
                            });                            
                        }
                    }
                });
            }
            else{
                return res.status(403).send('access denied');
            }
        });
    });

    //DELETE /deleteMessage
    app.delete('/messenger/deleteMessage', function (req, res) {
        var authRes = auth.verifyToken(req, function (authRes){
            if (authRes.success){
                let filter = {_id: req.query.messageId};
                Message.findOneAndRemove(filter, (err) => {
                    if (err) {
                        console.warn(err.message);
                        res.status(500).send(err.message);
                    }
                    else {
                        res.status(200).json({
                            success: true,
                            message: 'message deleted'
                        }).send();
                    }
                });
            }
            else{
                return res.status(403).send('access denied');
            }
        });
    });
}
