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
    io.set('log level', 1);
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
          socket.emit('joined',user.name);
      });
      
       //eventList return initially
      socket.on('eventList', function(data){
            Event.find()
                 .sort({_id:-1})
                 .exec(function(err, data){
                  
                   socket.emit('eventList', data);

                 });
      });

      socket.on('loadCases', function(_id){
         Case.find({_event : _id})
             .populate('attendants')
             .exec(function(err, cases){
                var ev = new Array();
                var re = new Array();
                var sdata;
                cases.forEach(function(data){
                  ev.push({
                            title: data.charger+'/'+ data.category+'/'+data.ampm+'/('+data.attendants.length+'/'+data.maxPosition+')',
                            start: data.startDate.yyyymmdd(),
                            _id: data._id,
                            //attendants: data.attendants,
                            type: "applyForm",
                            color: "gold"
                          });

                  data.attendants.forEach(function(ps){

                    re.push({ title: data.charger+'/'+ data.category+'/'+data.ampm+'/'+ps.number+'/'+ps.name,
                            start: data.startDate.yyyymmdd(),
                            _id: data._id,
                            attendants: data.attendants,
                            type: "result",
                            });

                        });
                  });

               sdata = { events: ev,
                         results : re
               
               };
                  
                             console.log(sdata);
                             socket.emit('loadCases',sdata);




               });
               

      });

      socket.on('loadResult', function(_id){
         
      });
      
      //event info load for calendar page in select specific event
      socket.on('loadEventInfo', function(data){
            Event.findOne({ _id : data })
                 .populate('priorList')
                 .populate('exceptors.except')
                 .exec(function(err, data){
                   socket.emit('loadEventInfo', data);
                 });
      });

      //apply for case
      socket.on('apply',function(data){

            Case.findOne({_id : data._id})
                .populate('_event')
                .exec(function(err, cas){
                   
                  var count=0;
                  var max = cas.maxPosition;
                  cas._event.applier.forEach(function(data){
                      console.log(data);
                      if(user._id.toString() === data.toString()){
                        count = count + 1;
                      }
                  });

                  console.log('count:'+count);
                  console.log( cas._event.exceptors);

                  cas._event.exceptors.forEach(function(data){
                    console.log(data.except);
                    console.log(data.num);

                    if(data.except.toString() === user._id.toString()){
                      max = data.num;
                  }});
                  console.log('max:'+max);


                  //apply for ordinary students
                  if(moment((new Date())).isAfter(cas._event.applyTime)&&moment((new Date())).isBefore(cas._event.applyEnd)){
                        //console.log(new Date());
                        //console.log(cas._event.applyTime);
                        //console.log(cas._event.applyEnd);

                          if(cas.attendants.length >= cas.maxPosition){
                            //console.log('full - or');
                            socket.emit('full');
                          }else{
                                cas.attendants.push(user._id);
                                cas.save(function(err){
                                  if(err)
                                  {
                                    socket.emit('alert', '서버 저장에 실패했습니다. 다시 시도해주세요.');
                                    return handleError(err);}
                                  else
                                  {
                                    socket.emit('applyOk', '신청성공!');
                                    console.log('apply - or');
                                  }
                                });

                                }
                 
                  //apply for prior 
                  }else if(cas._event.priorList.indexOf(user._id) != -1){

                        //console.log(new Date());
                        //console.log(cas._event.priorTime);
                        //console.log(cas._event.priorEnd);
                        //console.log(moment((new Date())).isAfter(cas._event.priorTime));
                        //console.log(moment((new Date())).isBefore(cas._event.priorEnd));
                        //console.log();

                      //confirmation existance of prior list
                          
                      if(moment((new Date())).isAfter(cas._event.priorTime)&&moment((new Date())).isBefore(cas._event.priorEnd)){
                        //console.log(new Date());
                        //console.log(cas._event.priorTime);
                        //console.log(cas._event.priorEnd);
                          //confirmation time bound for prior
                          if(cas.attendants.length >= cas.maxPosition){
                            //not available positions

                            socket.emit('alert', '이미 꽉찼습니다.');


                          }else{
                            //exist available positions
                            
                              var tmp;
                              cas.attendants.push(user._id);
                              cas._event.applier.push(user._id);
                              cas._event.save(function(err){
                                //console.log(cas._event);
                                if(err)
                                {
                                    socket.emit('dberrout');
                                }else{
                                    cas.save(function(err){
                                      if(err){
                                        socket.emit('dberr');
                                        return handleError(err);
                                      }else{

                                         User.findOne({_id: user._id}, function(err,user){ 
                                           console.log(user);
                                            if(err){
                                              socket.emit('alert','dberruser');
                                            }else{
                                                user.cases.push(cas._id); 
                                                console.log(user);

                                                user.save(function(err){
                                                  if(err){
                                                        socket.emit('alert','dberruser2');
                                                  }else{

                                                      socket.emit('applyOk','우선권자 신청성공!');}
                                                });
                                            }
                                            
                                         });


                                      }

                                  });                              
                              }

                            });
                          }
                      }
                  }else{
                         socket.emit('alert', '신청기간이 아닙니다.');
                  }


        });



      });

      socket.on('deleteEvent', function(data){
        console.log(data);

        Case.findOne({_id : data._id})
             .populate('attendants')
             .populate('_event')
             .exec(function(err, cs){
               if(err){
                    socket.emit('dberr');
               }else{
                 var idx = cs.attendants.indexOf(user._id);
                 cs.attendants.splice(idx,1);
                 var it = cs._event.applier.indexOf(user._id);
                 cs._event.applier.splice(it,1);
                 cs.save(function(err){
                    if(err){
                    socket.emit('dberr');
                    }else{
                      cs._event.save(function(err){

                           if(err){
                                socket.emit('dberr');
                           }else{
                                User.findOne({_id : user._id})
                                    .exec(function(err,us){
                                     if(err){
                                           socket.emit('dberr');
                                     }else{
      
                                       var ix = us.cases.indexOf(data._id);
                                       us.cases.splice(ix,1);
                                       us.save(function(err){
                                            if(err){
                                               socket.emit('dberr');
                                            }else{
                                               socket.emit('alert','삭제완료!');
                                            }//fifth else


                                       });
                                     
                                     }//forth else

                                }); 
                           
                           
                           }//third else

                      });


                      
                    }//second else
                 
                });




                //first else
                }

               });


        /////////////////
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


