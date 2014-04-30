(function() {
  "use strict";
  angular.module("hiin", ["ngCookies", "ngResource", "ngSanitize", "ngRoute", "services", "btford.socket-io", "ui.calendar"]).config(function($routeProvider) {
    $routeProvider.when("/", {
      templateUrl: "views/login/login.html",
      controller: "LoginCtrl"
    }).when("/signUp", {
      templateUrl: "views/login/signup.html",
      controller: "SignUpCtrl"
    }).when("/idLogin", {
      templateUrl: "views/login/id_login.html",
      controller: "idLoginCtrl"
    }).when("/cal", {
      templateUrl: "views/calv/calendar.html",
      controller: "calendarCtrl"
    }).when("/admin", {
      templateUrl: "views/admin/admin.html",
      controller: "adminCtrl"
    }).otherwise({
      redirectTo: "/"
    });
  }).config(function($httpProvider) {
    $httpProvider.defaults.transformRequest = function(data) {
      if (data === undefined) {
        return data;
      }
      return $.param(data);
    };
    return $httpProvider.defaults.withCredentials = true;
  });

  return;

}).call(this);
