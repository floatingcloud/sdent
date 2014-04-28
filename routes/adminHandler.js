var Event = require('../models/event');
var Case = require('../models/case');
var User = require('../models/user');
var async = require('async');
var mongoose = require('mongoose');


module.exports = function(app) {

  app.get('/userList', function(req, res, next){
      User.find()
          .sort({number:1})
          .exec(function(err, users){
              if(err) return handleError(err);
        
                corsSend(req, res, users);
          });

  
  });

  app.post('/makeEvent', function(req, res, next) {

    var eventProfile = req.body.event;
    var casesProfile = req.body.cases;
    var priorProfile = req.body.prior;

    var eventDoc={};
    var casesDoc={};
    var cases = [];
    var items;

    eventProfile.forEach(function(items){
      eventDoc.event = items[0];
      eventDoc.name = items[1];
      eventDoc.startDate = items[2];
      eventDoc.endDate = items[3];
      eventDoc.applyTime = items[4];
      eventDoc.applyEnd = items[5];
      eventDoc.priorTime = items[6];
      eventDoc.priorEnd = items[7];
    });

    eventDoc.priorList=[];
    priorProfile.forEach(function(items){
      eventDoc.priorList.push(items);
    });

    var ev = new Event(eventDoc);

    ev.save(function(err){
      if(err) return handleError(err);
         
         casesProfile.forEach(function(items){
            var cs = new Case({
            
              charger : items[0],
              category : items[1],
              startDate : items[2],
              ampm : items[3],
              maxPosition : items[4],
              _event : ev._id

              });
            cs.save(function(err){
             if(err){ return handleError(err);}
             else{
               ev.cases.push(cs._id);
               ev.save();
             }
           });
        });

        corsSend(req, res, 'success');
     });



});

}; 
