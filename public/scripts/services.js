'use strict';

// AngularJS 에서 module을 정의할 때 뒤에 dependecy list를 주게 되면 새로운 module을 정의하겠다는 소리고
// 단순히 angular.module('services') 하게 되면 기존에 만들어진 module을 refer하겠다는 의미임.

// services 라는 모듈 선언
angular.module('services', [])
  // API_PORT를 상수로 정의. API_PORT는 나중에 dependency injection에서 쓰일 수 있음.
  .constant('API_PORT', 3000)
  // API_HOST를 상수로 정의.
  //.constant('API_HOST', "http://localhost");
  .constant('API_HOST', "http://sdent.kr");

(function() {
  angular.module('services').factory('Host', function($window, API_HOST, API_PORT) {
    var host, _API_HOST, _API_PORT;
    _API_HOST = API_HOST;
    if ($window.localStorage != null) {
      host = $window.localStorage.getItem("api_host");
      console.log("localstorage host = " + host);
      if (host && host !== "") {
        _API_HOST = host;
      }
    }
    _API_PORT = API_PORT;
    return {
      getAPIHost: function() {
        return _API_HOST;
      },
      getAPIPort: function() {
        return _API_PORT;
      },
      setAPIPort: function(port) {
        console.log("set api port! host = " + port);
        return _API_PORT = port;
      }
    };
  });

}).call(this);

(function() {
  angular.module('services').factory('socket', function(socketFactory, Host) {
    return socketFactory({
      ioSocket: io.connect("" + (Host.getAPIHost()) + ":" + (Host.getAPIPort()) + "/")
    });
  });

}).call(this);

(function() {
  'use strict';
  angular.module('services').factory('Util', function($q, $http, $location, $document, Host) {
    return {
      makeReq: function(method, path, param) {
        console.log("" + (Host.getAPIHost()) + ":" + (Host.getAPIPort()) + "/" + path);
        return $http[method]("" + (Host.getAPIHost()) + ":" + (Host.getAPIPort()) + "/" + path, (method === "get" ? {
          params: param
        } : param), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      },
      Go: function(path) {
        return $location.path(path);
      },
      getUsersList: function() {
        var deferred;
        deferred = $q.defer();
        this.makeReq('get', 'userList').success(function(data) {
          return deferred.resolve(data);
        }).error(function(data, status) {
          return deferred.reject(status);
        });
        return deferred.promise;
      },
      getEventsList: function() {
        var deferred;
        deferred = $q.defer();
        this.makeReq('get', 'eventList').success(function(data) {
          return deferred.resolve(data);
        }).error(function(data, status) {
          return deferred.reject(status);
        });
        return deferred.promise;
      },
      deleteEvent: function(para) {
        var deferred;
        deferred = $q.defer();
        this.makeReq('post', 'deleteEvent', para).success(function(data) {
          return deferred.resolve(data);
        }).error(function(data, status) {
          return deferred.reject(status);
        });
        return deferred.promise;
      }
    };
  });

}).call(this);
