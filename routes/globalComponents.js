var bcrypt   = require('bcrypt-nodejs');

module.exports = function(nconf){
  var parse = require('express/node_modules/cookie').parse;
  var parseSC = require('express/node_modules/connect/lib/utils').parseSignedCookies;
  global.parseCookie = function(cookie){
    return parseSC((parse(cookie)),"rlaeodnjs");
  };
  global.getCode = function(cookie){
    return {
      code : code,
      message : nconf.get(code)
    };
  };

  global.respenseWithError = function(res, code){
    res.json(getCode(code), 200);
  };

  global.responseWithError = function(res, code){
    res.json(getCode(code), 400);
  };

  //islogin
  global.isLogin = function(req, res, next){

    if (req.session.user) {
       next();    
    } else {
      corsSend(req, res, 'not login');
    }
  };
  //not logged in 
  global.notLoggedIn = function(req, res, next) {
    if (req.session.user) {
      corsSend(req, res,'already login');
   } else {
      next();
    }
  };


  // checking user match case creater
  global.event_owner = function(req, res, next){
    if(req.session.user._id.toString() === req.session.event.author)
      next();
    else
      corsSend(req, res,'you are not creater');
  }


  // checking user doesn't match case creater
  global.not_event_owner = function(req, res, next){
    if(req.session.user._id.toString() === req.session.event.author)
       corsSend(req, res,'you are creater');
    else
      next();
  }


  //generating cors send 
  global.corsSend = function(req, res, data){
     res.header("Access-Control-Allow-Origin", req.headers.origin);
     res.header("Access-Control-Allow-Credentials", 'true');
     res.send(data);
  };

  // generating a hash
  global.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  // checking if password is valid
  global.validPassword = function(password1, password2) {
    return bcrypt.compareSync(password1, password2);
  };

};
  

