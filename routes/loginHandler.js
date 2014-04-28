/*
 * user login Routes
 */

var User = require('../models/user');

module.exports = function(app) {
 
  app.post('/login', notLoggedIn, function(req, res) {
          User.findOne({id: req.body.id}, function(err,user){

                   if(err){
                     return next(err);
                   }

                   if(user){
                     if(validPassword(req.body.password,user.password)){                     
                        req.session.user = user;
                        corsSend(req, res,'success login');
                     }else{
                       corsSend(req, res,'wrong password');
                     }
                   }else{
                     corsSend(req, res,'not exist email');
                   }
            });
  });

  // quit session log out
  app.get('/logout', function(req, res, next) {
    req.session.destroy();
    corsSend(req, res,"success logout");
  });

};

