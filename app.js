/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var dbURL = 'mongodb://localhost/sdent';
var db = require('mongoose').connect(dbURL);
var MongoStore = require('connect-mongo')(express);
var mongoose = require('mongoose');
var nconf = require('nconf');
//var MemoryStore = require('express/node_modules/connect/lib/middleware/session/memory');
var session_store = new MongoStore({db:'sdent'});
var connect = require('express/node_modules/connect');
//var client={};

var app = express();
var server = http.createServer(app);
var socket_io = require('socket.io');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Credentials", 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
http://ec2-54-209-162-175.compute-1.amazonaws.com/index.html
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({store: session_store ,
                         maxAge: new Date(Date.now() + 3600000),
                         secret: "rlaeodnjs"
                        }));
app.use(allowCrossDomain);

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// for passing session information into views
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//set socket server
var io = socket_io.listen(server);

// set nconf
nconf.file('../config/config.json');

//app controller load
app.get('/', function(req,res){
  res.render('login/login.jade');
});
app.get('/calview', function(req,res){
  res.render('index');
});

require('./routes/globalComponents')(nconf);
require('./routes/loginHandler')(app);
require('./routes/userHandler')(app);
require('./routes/adminHandler')(app);


//socket.io server starting
require('./routes/mainHandler')(io, connect, session_store, db);



//web starting server 
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

