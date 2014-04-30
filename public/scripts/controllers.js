(function() {
  'use strict';
  angular.module('hiin').controller('adminCtrl', function($scope, $q, $window, Util) {
    var $casesContainer, $eventContainer, $exceptionContainer, $priorContainer, sendData, userName, userNameE, user_id, user_idE;
    userName = [];
    user_id = [];
    userNameE = [];
    user_idE = [];
    $scope.header1 = ['담당자', '카테고리', '날짜', '시간', '배정인원'];
    $scope.header2 = ['이벤트', '이름', '시작일', '끝나는일', '신청시간', '신청종료', '우선신청', '우선종료', '신청횟수'];
    $scope.header3 = ['횟수에외', '횟수'];
    sendData = {};
    $casesContainer = {};
    $eventContainer = {};
    $priorContainer = {};
    $exceptionContainer = {};
    $scope.submit = function() {
      var tmpEx, tmpPrior;
      sendData.event = $eventContainer.data('handsontable').getData();
      sendData.cases = $casesContainer.data('handsontable').getData();
      sendData.prior = [];
      sendData.exception = [];
      tmpPrior = $priorContainer.data('handsontable').getData();
      tmpPrior.forEach(function(item) {
        var index;
        index = userName.indexOf(item[0]);
        return sendData.prior.push(user_id[index]);
      });
      tmpEx = $exceptionContainer.data('handsontable').getData();
      tmpEx.forEach(function(item) {
        var index;
        index = userNameE.indexOf(item[0]);
        sendData.exception.push({
          userId: user_idE[index],
          many: item[1]
        });
        console.log(index);
        console.log(item);
        return console.log(sendData.prior);
      });
      return Util.makeReq('post', 'makeEvent', sendData).success(function(data) {
        if (data !== 'success event create') {
          alert(data);
          return;
        }
        return Util.Go('admin');
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
    $casesContainer = $("#dataTable").handsontable({
      minRows: 10,
      rowHeaders: true,
      colHeaders: $scope.header1,
      contextMenu: true,
      manualColumnResize: true,
      columns: [
        {
          type: "text"
        }, {
          type: "text"
        }, {
          type: "date"
        }, {
          type: "autocomplete",
          filter: false,
          source: ["오전", "오후", "종일"]
        }, {
          type: "numeric"
        }
      ]
    });
    $eventContainer = $("#setting").handsontable({
      colHeaders: $scope.header2,
      manualColumnResize: true,
      startRows: 1,
      startCols: 9,
      columns: [
        {
          type: "text"
        }, {
          type: "text"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "date"
        }, {
          type: "numeric"
        }
      ]
    });
    $priorContainer = $("#prior").handsontable({
      rowHeaders: true,
      colHeaders: ['우선권자'],
      contextMenu: true,
      startCols: 1,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "autocomplete",
          filter: false,
          source: userName,
          strict: true
        }
      ]
    }, {
      beforeInit: Util.getUsersList().then(function(data) {
        var item, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          userName.push(item.number + item.name);
          _results.push(user_id.push(item._id));
        }
        return _results;
      }, function(status) {
        return alert(status);
      })
    });
    $exceptionContainer = $("#exception").handsontable({
      rowHeaders: true,
      colHeaders: $scope.header3,
      contextMenu: true,
      startCols: 2,
      startRows: 1,
      manualColumnResize: true,
      columns: [
        {
          type: "autocomplete",
          filter: false,
          source: userName,
          strict: true
        }, {
          type: "numeric"
        }
      ]
    }, {
      beforeInit: Util.getUsersList().then(function(data) {
        var item, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          userNameE.push(item.number + item.name);
          _results.push(user_idE.push(item._id));
        }
        return _results;
      }, function(status) {
        return alert(status);
      })
    });
    Util.getEventsList().then(function(data) {
      return $scope.events = data;
    }, function(status) {
      return alert(status);
    });
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('calendarCtrl', function($scope, $window, socket, Util) {
    var clock;
    clock = angular.element("#clock").FlipClock({
      clockFace: 'TwelveHourClock'
    });
    $scope.uiConfig = {
      calendar: {
        editable: true,
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: function(event) {
          var sendData;
          console.log(event);
          if (event.type === "applyForm") {
            sendData = {
              _id: event._id
            };
            socket.emit('apply', sendData);
          } else {
            sendData = {
              _id: event._id
            };
          }
          socket.emit('deleteEvent', sendData);
          return console.log('delete');
        }
      }
    };
    $scope.eventSources = [];
    socket.emit('join');
    socket.on('joined', function(data) {
      return console.log(data + 'join socket');
    });
    socket.emit('eventList');
    socket.on('eventList', function(data) {
      console.log(data);
      return $scope.events = data;
    });
    socket.on('loadEventInfo', function(data) {
      console.log(data);
      return $scope.eventInfo = data;
    });
    socket.on('serverTime', function(data) {
      return clock.setTime(data);
    });
    socket.on('loadCases', function(data) {
      console.log(data);
      $scope.eventSources.splice(0, $scope.eventSources.length);
      $scope.eventSources.push(data.events);
      return $scope.eventSources.push(data.results);
    });
    socket.on('alert', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      return alert(data);
    });
    socket.on('applyOk', function(data) {
      socket.emit('loadCases', $scope.currentEventId);
      return alert(data);
    });
    $scope.loadEvent = function(event) {
      $scope.currentEventName = event.name;
      $scope.currentEventId = event._id;
      socket.emit('loadCases', event._id);
      return socket.emit('loadEventInfo', event._id);
    };
    $scope.userName = sessionStorage.loginUserName;
    $scope.caseClick = function() {};
    $scope.clockRe = function() {
      socket.emit('serverTime');
      return console.log('serverTime');
    };
    return $scope.logout = function() {
      return Util.makeReq('get', 'logout').success(function(data) {
        if (data !== 'success logout') {
          alert(data);
          return;
        }
        return Util.Go('/');
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('idLoginCtrl', function($scope, $window, Util) {
    return $scope.signIn = function() {
      return Util.makeReq('post', 'login', $scope.userInfo).success(function(data) {
        if (data === 'wrong password' || data === 'not exist email' || data === 'no entered event') {
          alert(data);
          return;
        }
        return Util.makeReq('get', 'loginUser').success(function(data) {
          sessionStorage.setItem("logined", true);
          sessionStorage.setItem("loginUserName", data.name);
          sessionStorage.setItem("loginUserStNum", data.studentNumber);
          sessionStorage.setItem("loginUserNumber", data.number);
          sessionStorage.setItem("loginUserObjid", data._id);
          return Util.Go('cal');
        }).error(function(error, status) {
          console.log(status);
        });
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('LoginCtrl', function($scope, $window, Util) {
    $scope.signUp = function() {
      return Util.Go('signUp');
    };
    return $scope.idLogin = function() {
      return Util.Go('idLogin');
    };
  });

}).call(this);

(function() {
  'use strict';
  angular.module('hiin').controller('SignUpCtrl', function($scope, $window, Util) {
    return $scope.signUp = function() {
      return Util.makeReq('post', 'user', $scope.userInfo).success(function(data) {
        if (data !== 'success user create') {
          alert(data);
          return;
        }
        return Util.Go('login');
      }).error(function(error, status) {
        return console.log("$http.error");
      });
    };
  });

}).call(this);
