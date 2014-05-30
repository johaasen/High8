var app = angular.module('Mampf-Angular', [
  "ngRoute",
  "ngTouch",
  "mobile-angular-ui"
]);

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(false); //TODO effects of (true)?
  $routeProvider.when('/',          {templateUrl: "home.html"});
  $routeProvider.when('/details',    {templateUrl: "details.html"});
});

/* 
  TODO: To be discussed:
  - encapsulation of MampfAPI and config object like currently implemented useful?
  - usage of angular.factory vs. angular.service
*/

app.factory('MampfConfig', function() {
  // model for configuration of MampfAPI
  var MampfConfig = {};
  var config = {};
  config.identity = "";
  config.invitees = [];
  config.currentPosition = [];
  config.timeslots = [];
  
  MampfConfig.getConfig = function() { return config; };

  MampfConfig.setIdentity = function(identity) { config.identity = identity; };
  MampfConfig.getIdentity = function() { return config.identity; };

  MampfConfig.delInvitees = function() { config.invitees = []; };
  MampfConfig.getInvitees = function() { return config.invitees; };
  MampfConfig.addInvitee = function(invitee) { config.invitees.push(invitee); };
  MampfConfig.remInvitee = function(invitee) {
    var pos = config.invitees.indexOf(invitee);
    if (pos > -1) {
      config.invitees.splice(pos, 1);
      return true;
    }else{
      return false;
    }
  };
  
  MampfConfig.setCurrentPos = function(currentPosition) { config.currentPosition = currentPosition; };
  MampfConfig.getCurrentPos = function() { return config.currentPosition; };

  MampfConfig.delTimeslots = function() { config.timeslots = []; };
  MampfConfig.getTimeslots = function() { return config.timeslots; };
  MampfConfig.addTimeslot = function(timeslot) { config.timeslots.push(timeslot); };
  MampfConfig.remTimeslot = function(timeslot) {
    for (var pos in config.timeslots) {
      if (config.timeslots[pos].hasOwnProperty("startTime") && config.timeslots[pos].hasOwnProperty("startTime")){
        if(config.timeslots[pos].startTime === timeslot.startTime && config.timeslots[pos].endTime === timeslot.endTime){
          config.timeslots.splice(pos,1);
          return true;
        }
      }
    }
    return false;
  };
  
  return MampfConfig;
});

/*

//TODO: separate MampfAPI service necessary?
app.service('MampfConnection', function(){
  var url = "http://dennistempi.itm.uni-luebeck.de/mampf/";
  var api = new MampfAPI(url);
});
*/

app.controller('MainController', function($rootScope, $scope, MampfConfig){

  // General
  $rootScope.$on("$routeChangeStart", function(){
    $rootScope.loading = true;
  });

  $rootScope.$on("$routeChangeSuccess", function(){
    $rootScope.loading = false;
  });

  // Details Screen
  // Test User Agent
  $scope.userAgent = "Press Button!";
  $scope.checkAgent = function(){
    $scope.userAgent =  navigator.userAgent;
  };

  // Mampf Backend Connection
  $scope.testMampfString = "Press Button!";
  $scope.mampfCon = new MampfAPI(BACKEND_URL);
  
  // Fill MampfConfig with demo values
  MampfConfig.setIdentity("ich");
  MampfConfig.addInvitee("invitee1");
  MampfConfig.addInvitee("invitee2");
  MampfConfig.setCurrentPos({"longitude" : 9.170299499999999, "latitude" : 48.773556600000006});
  MampfConfig.addTimeslot({"startTime":"2014-05-28T11:22:03.816+02:00", "endTime":"2014-05-28T13:22:03.817+02:00"});
  MampfConfig.addTimeslot({"startTime":"2014-05-28T13:22:03.817+02:00", "endTime":"2014-05-28T15:22:03.817+02:00"});
  console.log(MampfConfig.getConfig());
    
  $scope.testBackendCon = function(){
    $scope.mampfCon.config = MampfConfig.getConfig();
    $scope.mampfCon.findMatches();
    $scope.testMampfString = "Check Console & Network!";
  };
  
});