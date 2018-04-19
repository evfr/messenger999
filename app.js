'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/config'); // get our config file
var app = express();
var messagingController = require('./controllers/messaging.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);

//connect to mongo
console.log("mongodb://"+ config.dbConnection.dbUser + ":" + config.dbConnection.dbPassword + config.dbConnection.dbServer + "/" + config.dbConnection.database);
mongoose.connect("mongodb://"+ config.dbConnection.dbUser + ":" + config.dbConnection.dbPassword + config.dbConnection.dbServer + "/" + config.dbConnection.database, function (err, db) {
  if (err) {
    console.warn(err.message);
  }
});

app.use(function (req, res, next) {
  req.db = mongoose.connection;
  next();
});

messagingController(app);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port);
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = server;