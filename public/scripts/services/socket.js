(function() {
  angular.module('services').factory('socket', function(socketFactory, Host) {
    return socketFactory({
      ioSocket: io.connect("" + (Host.getAPIHost()) + ":" + (Host.getAPIPort()) + "/")
    });
  });

}).call(this);
