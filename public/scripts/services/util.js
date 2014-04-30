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
