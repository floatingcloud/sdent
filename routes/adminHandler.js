var Event = require('../models/event');
var Case = require('../models/case');
var User = require('../models/user');
var async = require('async');
var mongoose = require('mongoose');


module.exports = function(app) {
  // return event list
  app.get('/eventList',function(req, res, next){
        Event.find()
             .sort({_id:-1})
             .exec(function(err, data){
               res.send(data);

              });

  });


  // return user list
  app.get('/userList', function(req, res, next){
      User.find()
          .sort({number:1})
          .exec(function(err, users){
              if(err){
                res.send('db error');
              }else{
                res.send(users);
              }
          });

  
  });

  app.post('/deleteEvent', function(req, res, next){
  
  });

  app.post('/makeEvent', function(req, res, next) {

    var eventProfile = req.body.event;
    var casesProfile = req.body.cases;
    var priorProfile = req.body.prior;
    var exceptionProfile = req.body.exception;

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
      eventDoc.min = items[8];
    });

    eventDoc.priorList=[];
    priorProfile.forEach(function(items){
      eventDoc.priorList.push(items);
    });

    eventDoc.applyNum=[];
    var tempc={};
    tempc["count"]=1;
    eventDoc.applyNum.push(tempc);
    console.log(tempc);
    console.log(eventDoc);

 
    var ev = new Event(eventDoc);

    ev.save(function(err){
      if(err) {
        console.log(err);
      };
         
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

       exceptionProfile.forEach(function(items){
         //var tp = {
          //_user : items.userId,
          //howMnay : items.many,
          //_event : ev._id
         //};
         var tp2 = {
          except : items.userId,
          num : items.many
         };
         console.log(tp2);
         ev.exceptors.push(tp2);
         //var ex = new Except(tp);

         //ex.save(function(err){
           //if(err){}
           //else
           //{
             //ev.exceptionList.push(ex._id);
             ev.save();
           
           //}

        //});
       });

        res.send('success');
     });

  });

}
