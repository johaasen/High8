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

app.service('MampfConfig', function() {
  // model for configuration of MampfAPI
  this.config = {};
  this.config.identity = "";
  this.config.invitees = [];
  this.config.currentPosition = [];
  this.config.timeslots = [];
  
  this.getConfig = function() { return this.config; };

  this.setIdentity = function(identity) { this.config.identity = identity; };
  this.getIdentity = function() { return this.config.identity; };

  this.delInvitees = function() { this.config.invitees = []; };
  this.getInvitees = function() { return this.config.invitees; };
  this.addInvitee = function(invitee) { this.config.invitees.push(invitee); };
  this.remInvitee = function(invitee) {
    var pos = this.config.invitees.indexOf(invitee);
    if (pos > -1) {
      this.config.invitees.splice(pos, 1);
      return true;
    }else{
      return false;
    }
  };
  
  this.setCurrentPos = function(currentPosition) { this.config.currentPosition = currentPosition; };
  this.getCurrentPos = function() { return this.config.currentPosition; };

  this.delTimeslots = function() { this.config.timeslots = []; };
  this.getTimeslots = function() { return this.config.timeslots; };
  this.addTimeslot = function(timeslot) { this.config.timeslots.push(timeslot); };
  this.remTimeslot = function(timeslot) {
    for (var pos in this.config.timeslots) {
      if (this.config.timeslots[pos].hasOwnProperty("startTime") && this.config.timeslots[pos].hasOwnProperty("startTime")){
        if(this.config.timeslots[pos].startTime === timeslot.startTime && this.config.timeslots[pos].endTime === timeslot.endTime){
          this.config.timeslots.splice(pos,1);
          return true;
        }
      }
    }
    return false;
  };
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

  console.log(MampfConfig.config);
    
  $scope.testBackendCon = function(){
    $scope.mampfCon.config = MampfConfig.getConfig();
    $scope.mampfCon.findMatches();
    $scope.testMampfString = "Check Console & Network!";
  };
  
});