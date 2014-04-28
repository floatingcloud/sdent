/*
 * main page socket contorlling  
 */
var Event = require('../models/event');
var Case = require('../models/case');
var User = require('../models/user');
var async = require('async');
var mongoose = require('mongoose');
var moment = require('moment');

Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = this.getDate().toString();
        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};


module.exports = function(io, connect,  sessionStore) {



  io.configure(function(){
    io.set('log level', 3);
    io.set('transports', [
        'websocket'
      , 'flashsocket'
      , 'htmlfile'
      , 'xhr-polling'
      , 'jsonp-polling'
    ]);

    io.set('authorization',function(data, accept){

        if(data.headers.cookie){
          var cookies = parseCookie(data.headers.cookie);
          if(cookies['connect.sid']){
            sessionStore.get(cookies['connect.sid'], function(error, session){
              if(session && session.user ){
                data.user = session.user;
                accept(null, true);
              }else{accept('ERROR', true);}
            });
          }else{accept('ERROR', false);};
        }

  
    });  

  });

  var Room = io
    .on('connection', function(socket) {

       var user = socket.handshake.user;
       user.socketId = socket.id;
       //client["sockets:"+user._id.toString()]=socket.id;


       socket.on('join', function() {
          console.log('hihi');
          socket.emit('joined',user.name);
      });
      
       //eventList return initially
      socket.on('eventList', function(data){
            console.log('eventlist');
            Event.find()
                 .sort({_id:-1})
                 .exec(function(err, data){
                  
                   socket.emit('eventList', data);

                 });
      });

      socket.on('loadCases', function(_id){
         Case.find({_event : _id})
             .exec(function(err, cases){
                var ev = new Array();
                cases.forEach(function(data){
                  ev.push({
                            title: data.category+'/'+data.charger+'/'+data.ampm+'/('+data.attendants.length+'/'+data.maxPosition+')',
                            start: data.startDate.yyyymmdd(),
                            _id: data._id,
                            attendants: data.attendants
                            //_event : data._event
                          });
               });
               var sdata = { events: ev};
               console.log(sdata);
               socket.emit('loadCases',ev);
             });

      });

      //apply for case
      socket.on('apply',function(data){

            Case.findOne({_id : data._id})
                .populate('_event')
                .exec(function(err, cas){

                  //apply for prior 
                  if(cas._event.priorList.indexOf(user._id) != -1){
                      //confirmation existance of prior list

                      if(moment((new Date())).isAfter(cas._event.priorTime)&&moment((new Date())).isBefore(cas._event.priorEnd)){
                        console.log(new Date());
                        console.log(cas._event.priorTime);
                        console.log(cas._event.priorEnd);
                       //confirmation time bound for prior
                          if(cas.attendants.length >= cas.maxPosition){
                            //not available positions

                            socket.emit('full');
                            console.log('full - pr');


                          }else{
                            //exist available positions
                            cas.attendants.push(user._id);
                            cas.save(function(err){
                              if(err){
                                socket.emit('dberr');
                                return handleError(err);}
                              else{
                                socket.emit('applyOk');
                                console.log('apply - pr');

                              }

                            });
                          }
                      }

                   }
                
                  //apply for ordinary students
                  if(moment((new Date())).isAfter(cas._event.applyTime)&&moment((new Date())).isBefore(cas._event.applyEnd)){
                        console.log(new Date());
                        console.log(cas._event.applyTime);
                        console.log(cas._event.applyEnd);

                          if(cas.attendants.length >= cas.maxPosition){
                            console.log('full - or');
                            socket.emit('full');
                          }else{
                                cas.attendants.push(user._id);
                                cas.save(function(err){
                                  if(err)
                                  {
                                    socket.emit('dberr');
                                    return handleError(err);}
                                  else
                                  {
                                    socket.emit('applyOk');
                                    console.log('apply - or');
                                  }
                                });

                                }
                      }else{

                      }

            });




      });
      


      socket.on('serverTime', function() {
        socket.emit('serverTime', (new Date()));
      });

     socket.on('message', function(data) {
          socket.sockets.json.send(data);
      });

     socket.on('leave', function(data) {
     });
  });
}


