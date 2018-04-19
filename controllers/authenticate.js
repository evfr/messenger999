'use strict';

var jwt    = require('jsonwebtoken');
var config = require('../config/config'); // get our config file

var User = require('../models/user');

module.exports = {
  authenticate: authenticate,
  verifyToken: verifyToken
};

//POST /authenticate
function authenticate(req, callback) {
  var retVal;
  var filter = {name: req.body.name, password: req.body.password };

  User.find(filter, (err, foundUsers) => {
    if (err) {
      console.warn(err.message);
      retVal = {success: false, message: err.message};
    }
    else if (!foundUsers.length){
      console.warn("no user found");
      retVal = {success: false, message: "no user found" };
    }
    else {
      try {
        var token = jwt.sign({ name: foundUsers[0].name, roleId: 1, id: foundUsers[0]._id }, config.secret, {
            expiresIn: '365d' // expires in 24 hours x 10
        });
        retVal = { success: true, token: token };
      } 
      catch (e) {
        retVal = { success: false, message: 'Execution exception.' };
      }      
    }
    callback(retVal);
  });
}

//PUT /token
function verifyToken(req, callback){
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.cookies._token.token;
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {
        if(err){
          callback( { success: false, message: 'Failed to authenticate token' });
        }
        else{
          callback ({
            success: true,
            message: 'Valid token provided',
            payload: { 'name': decoded.name, 'id': decoded.id }
          });
        }
      });
    } else {
      // if there is no token return an error
      callback({
          success: false,
          message: 'No token provided'
      });
    }
}

