var app = angular.module('Mampf-Angular', [
  "ngRoute",
  "ngTouch",
  "mobile-angular-ui"
]);

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(false);
  //TODO effects of (true)?
  $routeProvider.when('/',          {templateUrl: "home.html"});
  $routeProvider.when('/details',    {templateUrl: "details.html"});
  $routeProvider.when('/testBackend',    {templateUrl: "testBackend.html"});
});

/* 
  TODO: 
  General app.js discussion
  - encapsulation of MampfAPI and config object like currently implemented useful?
  - usage of angular.factory vs. angular.service
  - one MainController to rule them all (?)
*/

/*
//TODO: separate MampfAPI service necessary?
app.service('MampfConnection', function(){
  var url = "http://dennistempi.itm.uni-luebeck.de/mampf/";
  var api = new MampfAPI(url);
});
*/

app.service('MampfConfig', function() {
  // service for configuration of MampfAPI
  // this.config is the actual model

  // TODO:
  // - remove this.config and use this.identity etc. directly (?)
  //    - benefit of separate config object is that we can access the config without function definition
  //      otherwise the getConfig() function needs to concatenate everything to store it in LS or pass to API
  // - remove getter (?), model can be accessed with mampfconfig.config anyway
  // - md5 encoding for identity and invitees - should it be done here?

  // Init localStorage
  if(typeof(Storage) != "undefined"){
    this.localStorageAvailable  = true;
  }else{
    this.localStorageAvailable = false;
  }

  // Init model object
  this.config = {};
  this.config.identity = "";
  this.config.invitees = [];
  this.config.currentPosition = [];
  this.config.timeslots = [];
  
  // Functions to update/read model
  this.getConfig = function() { return this.config; };
  this.saveConfig = function() {
    if(this.localStorageAvailable){
      localStorage.setItem("MampfConfig", JSON.stringify(this.config));
      return true;
    }else{
      console.log("localStorage not available");
      return false;
    }
  };
  this.loadConfig = function() {
    if(this.localStorageAvailable){
      this.config = JSON.parse(localStorage.getItem("MampfConfig"));
    }else{
      console.log("localStorage not available");
      return false;
    }
  };

  this.setIdentity = function(identity) { this.config.identity = identity; };
  this.getIdentity = function() { return this.config.identity; };

  this.delInvitees = function() { this.config.invitees = []; };
  this.getInvitees = function() { return this.config.invitees; };
  this.addInvitee = function(invitee) {
    var pos = this.config.invitees.indexOf(invitee);
    if (pos > -1) {
      return false;
    }else{
      this.config.invitees.push(invitee);
      return true;
    }
  };
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
  this.isTimeslotInModel = function(timeslot) {
    // auxiliary function similar to indexOf
    for (var pos in this.config.timeslots) {
      if (this.config.timeslots[pos].hasOwnProperty("startTime") && this.config.timeslots[pos].hasOwnProperty("endTime")){
        if(this.config.timeslots[pos].startTime === timeslot.startTime && this.config.timeslots[pos].endTime === timeslot.endTime){
          // timeslot is in model - return true
          return pos;
        }
      }
    }
    return -1;
  };
  this.addTimeslot = function(timeslot) {
    //push(timeslot) adds reference to input fields(?), workaround:
    //push({"startTime": timeslot.startTime, "endTime":timeslot.endTime})
    var pos = this.isTimeslotInModel(timeslot);
    if(pos > -1){
      return false;
    }else{
      this.config.timeslots.push({"startTime": timeslot.startTime, "endTime":timeslot.endTime});
      return true;
    }
  };
  this.remTimeslot = function(timeslot) {
    var pos = this.isTimeslotInModel(timeslot);
    if(pos > -1) {
      this.config.timeslots.splice(pos,1);
      return true;
    }else{
      return false;
    }
  };
});

app.controller('MainController', function($rootScope, $scope, $timeout, MampfConfig){

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

  // Test Backend Screen
  // Mampf Backend Connection
  $scope.mampfCon = new MampfAPI(BACKEND_URL);
  $scope.mampfConfig = MampfConfig;

  $scope.logConfig = function(){
    console.log($scope.mampfConfig.config);
  };

  // default values for input fields
  $scope.newInvitee = "Invitee_3";
  $scope.newTimeslot = {};
  $scope.newTimeslot.startTime = "2014-05-29T11:22";
  $scope.newTimeslot.endTime = "2014-05-29T13:22";
  
  // Fill MampfConfig with demo values
  // TODO: delete
  $scope.mampfConfig.setIdentity("DemoIdentity");
  $scope.mampfConfig.addInvitee("Invitee_1");
  $scope.mampfConfig.addInvitee("Invitee_2");
  $scope.mampfConfig.setCurrentPos({"longitude" : 9.170299499999999, "latitude" : 48.773556600000006});
  $scope.mampfConfig.addTimeslot({"startTime":"2014-05-28T11:22:03.816+02:00", "endTime":"2014-05-28T13:22:03.817+02:00"});
  $scope.mampfConfig.addTimeslot({"startTime":"2014-05-28T13:22:03.817+02:00", "endTime":"2014-05-28T15:22:03.817+02:00"});
  $scope.logConfig();

  $scope.findMatches = function(){
    $rootScope.loading = true;

    $scope.mampfCon.config = $scope.mampfConfig.config;
    $scope.mampfCon.findMatches();/*function(response){
      //callback
      console.log(response);
      $rootScope.loading = false;
    });*/
    
    //TODO: callback function not yet implemented - timeout loading indicator after 0.5 sec
    $timeout(function() {$rootScope.loading = false;}, 500);

  };

  // Geolocation
  $scope.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition($scope.updatePosition, $scope.locationError);
    }else{
      console.log("Geolocation is not supported by this browser.");
    }
  };

  $scope.updatePosition = function(position) {
    $scope.mampfConfig.setCurrentPos({"longitude" : position.coords.longitude, "latitude" : position.coords.latitude});
    $scope.$apply();
  };

  $scope.locationError = function(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log(x.innerHTML="An unknown error occurred.");
        break;
    }
  };

});