/*
 * User Routes
 */
var async = require('async');
var User = require('../models/user');

module.exports = function(app) {

  var maxUsersPerPage = 5;
  // user list view by page - client must send page by query
  app.get('/users', function(req, res, next){
    var page = req.query.page&&paresInt(req.query.page, 10)||0;

    async.parallel([
      
      function(next){
        User.count(next);
      },

      function(next){
        User.find({})
            .skip(page*maxUsersPerPage)
            .limit(maxUsersPerPage)
            .exec(next);
      }
    ],

    function(err, results){
      if(err){
        return next(err);
      }

      var count = results[0];
      var users = results[1];

      var lastPage = (page+1) * maxUsersPerPage >= count;

      corsSend(req, res, users); 

    });
  });


  // create new user
  app.post('/user', notLoggedIn, function(req, res, next) {

    var userDoc = {
        id : req.body.id,
        password : generateHash(req.body.password),
        name : req.body.name,
        studentNumber : req.body.studentNumber,
        number : req.body.number,
        lastLoginTime : new Date(),
        events : []
     };
    User.create(userDoc, function(err){

      if(err){
        if(err.code === 11000){
          corsSend(req, res,'already exist');
        }else{
          corsSend(req, res,'server error');
          next(err);
        }
      }else{
        corsSend(req, res,'create ok');
      }

    });
  });


  // send user profile 
  app.get('/loginUser', function(req, res, nexxt){
    corsSend(req, res, req.session.user);
  });


  // delete user profile
  app.del('/user', isLogin, 
                    function(req, res, next) {
                        User.remove({_id:req.session.user._id}, function(err) {
                           if (err) { return next(err); }
                           req.session.destroy();
                           corsSend(req, res,'success user delete');});
                       }
         );


  // update user profile
  app.put('/user', isLogin, 
                    function(req, res, next){ 
                      var userDoc = {
                      id : req.body.id,
                      password : generateHash(req.body.password),
                      name : req.body.name,
                      studentNumber : String,
                      lastLoginTime : Date,
                      };


                      User.update({_id:req.session.user._id},{ $set: userDoc}, function(err){
                           if(err){ return next(err); }
                           corsSend(req, res,'success user update');
                      });
               }
         );

};


