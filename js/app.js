var app = angular.module('Mampf-Angular', [
  "ngRoute",
  "ngTouch",
  "mobile-angular-ui"
]);

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(false);  //TODO effects of (true)?
  $routeProvider.when('/',          {templateUrl: "home.html"});
  $routeProvider.when('/details',    {templateUrl: "details.html"});
  $routeProvider.when('/testBackend',    {templateUrl: "testBackend.html"});
});

/* 
  TODO: 
  General app.js discussion
  - angular.factory vs. angular.service
  - one MainController to rule them all (?)
  - getter Funktionen (?), config.model.xyz geht 
  - Kontakte:
    - generelle Struktur (?)
    - md5 encoding für identity + contacts in model service (?)
*/

app.service('Config', function() {
  // service that holds the global model and provides update functions
  // this.model is the global model

  // init local storage
  if(typeof(Storage) != "undefined"){
    this.localStorageAvailable  = true;
  }else{
    this.localStorageAvailable = false;
  }

  // init model object
  this.model = {};
  this.model.identity = {}; // {"phone":"017600000000","md5":"ASDF"}
  this.model.position = {}; // {"longitude" : 9.170299499999999, "latitude" : 48.773556600000006}
  this.model.contacts = []; // [ {"name" : "Peter", "phone" : 012345, "md5" : "ASDF", "lunch" : true}, {next} ]
  this.model.timeslots = []; // [ {"startTime":1401621970786,"endTime":1401629170786}, {next}]
  
  // get API config
  this.getMampfAPIModel = function(){
    // should look like this
    // var demoConfig1 = {"identity":"B25BF7426FABCADF01103045FD7707CE",
    //                    "invitees":["A9B9D2ED66A5DA2AFB3247F6947F5591"],
    //                    "currentPosition":{"longitude":9.170299499999999,"latitude":48.773556600000006},
    //                    "timeslots":[{"startTime":1401621970786,"endTime":1401629170786},
    //                                 {"startTime":1401629170786,"endTime":1401636370786}]};

    var mampfConfig = {};
    mampfConfig.identity = this.model.identity.md5;
    mampfConfig.currentPosition = this.model.position;
    mampfConfig.timeslots = this.model.timeslots;
    mampfConfig.invitees = [];
    
    for (var pos in this.model.contacts) {
      if (this.model.contacts[pos].hasOwnProperty("md5") && this.model.contacts[pos].hasOwnProperty("lunch")){
        if(this.model.contacts[pos].lunch === true){
          mampfConfig.invitees.push(this.model.contacts[pos].md5);
        }
      }
    }

    return mampfConfig;
  };

  // local storage functions
  this.saveModel = function() {
    if(this.localStorageAvailable){
      localStorage.setItem("MampfModel", angular.toJson(this.model));
      return true;
    }else{
      console.log("localStorage not available");
      return false;
    }
  };

  this.loadModel = function() {
    if(this.localStorageAvailable){
      this.model = angular.fromJson(localStorage.getItem("MampfModel"));
    }else{
      console.log("localStorage not available");
      return false;
    }
  };

  // functions to update model
  this.delContacts = function() {
    this.model.contacts = [];
  };

  this.addContact = function(name, phone) {
    //TODO: check if phone no. already in contacts
    var contact = {};
    contact.name = name;
    contact.phone = phone;
    contact.md5 = md5(phone).toUpperCase();
    contact.lunch = false;

    this.model.contacts.push(contact);
  };

  this.getContactByPhone = function(phone) {
    for (var pos in this.model.contacts) {
      if (this.model.contacts[pos].hasOwnProperty("phone")){
        if(this.model.contacts[pos].phone == phone){
          return this.model.contacts[pos];
        }
      }
    }
    return undefined;
  };

  this.getContactByMD5 = function(md5) {
    for (var pos in this.model.contacts) {
      if (this.model.contacts[pos].hasOwnProperty("md5")){
        if(this.model.contacts[pos].md5 == md5){
          return this.model.contacts[pos];
        }
      }
    }
    return undefined;
  };

  this.toggleLunchWithContact = function(contact) {
    var pos = this.model.contacts.indexOf(contact);
    this.model.contacts[pos].lunch = !(this.model.contacts[pos].lunch);
  };

  this.remContact = function(contact) {
    var pos = this.model.contacts.indexOf(contact);
    if (pos > -1) {
      this.model.contacts.splice(pos, 1);
      return true;
    }else{
      return false;
    }
  };
  
  this.setIdentity = function(phone) {
    this.model.identity.phone = phone;
    //TODO: format phone number
    //remove spaces, hyphens, blahblah
    this.model.identity.md5 = md5(phone).toUpperCase();
  };

  this.setPosition = function(position) {
    this.model.position = position;
  };

  this.delTimeslots = function() {
    this.model.timeslots = [];
  };

  this.getTimeslotIndex = function(timeslot) {
    // auxiliary function similar to indexOf
    for (var pos in this.model.timeslots) {
      if (this.model.timeslots[pos].hasOwnProperty("startTime") && this.model.timeslots[pos].hasOwnProperty("endTime")){
        if(this.model.timeslots[pos].startTime === timeslot.startTime && this.model.timeslots[pos].endTime === timeslot.endTime){
          return pos;
        }
      }
    }
    return -1;
  };

  this.addTimeslot = function(timeslot) {
    var pos = this.getTimeslotIndex(timeslot);
    if(pos > -1){
      return false;
    }else{
      this.model.timeslots.push({"startTime": timeslot.startTime, "endTime":timeslot.endTime});
      return true;
    }
  };

  this.remTimeslot = function(timeslot) {
    var pos = this.getTimeslotIndex(timeslot);
    if(pos > -1) {
      this.model.timeslots.splice(pos,1);
      return true;
    }else{
      return false;
    }
  };
});

app.controller('MainController', function($rootScope, $scope, $timeout, Config){

  // loading indicator on page nav
  $rootScope.$on("$routeChangeStart", function(){
    $rootScope.loading = true;
  });

  $rootScope.$on("$routeChangeSuccess", function(){
    $rootScope.loading = false;
  });

  // bind Config service to $scope, so that it is available in html
  $scope.config = Config;

  // backend connection for Mampf API (mampfBackendConnection.js)
  $scope.mampfCon = new MampfAPI(BACKEND_URL);

  // call Mampf API 
  $scope.findMatches = function(){
    $rootScope.loading = true;

    $scope.mampfCon.config = $scope.config.getMampfAPIModel();
    $scope.mampfCon.findMatches(function(response){
      //callback
      $scope.response = {};
      $scope.response.full = response;
      $scope.response.names = [];
      response.subjects.forEach(function(subject) {
        $scope.response.names.push($scope.config.getContactByMD5(subject).name);
      });
      $scope.$apply();

      console.log($scope.response);

      $rootScope.loading = false;
      $rootScope.$apply();

      $scope.toggle("responseOverlay");
    });
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
    $scope.config.setPosition({"longitude" : position.coords.longitude, "latitude" : position.coords.latitude});
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

  // **********
  // demo / test functions and demo setup follows
  // **********
  $scope.logGlobalModel = function(){
    console.log($scope.config.model);
  };

  // default values for input fields
  $scope.newInvitee = "";
  $scope.newTimeslot = {};
  $scope.newTimeslot.startTime = "";
  $scope.newTimeslot.endTime = "";
  
  // fill model with demo values
  $scope.initAsPeter = function(){
    // Peter is Identity  
    $scope.config.setIdentity("0176000000");
    $scope.config.addContact("Hans","0175000000");
    $scope.config.toggleLunchWithContact($scope.config.getContactByPhone("0175000000"));
  };

  $scope.initAsHans = function(){
    // Hans is Identity
    $scope.config.setIdentity("0175000000");
    $scope.config.addContact("Peter","0176000000");
    $scope.config.toggleLunchWithContact($scope.config.getContactByPhone("0176000000"));
  };

  //$scope.initAsHans();
  $scope.initAsPeter();
  $scope.config.addContact("Franz","0174000000");
  $scope.config.setPosition({"longitude" : 9.170299499999999, "latitude" : 48.773556600000006});
  $scope.config.addTimeslot({"startTime":1401621970786,"endTime":1401629170786});
  $scope.config.addTimeslot({"startTime":1401629170786,"endTime":1401636370786});
  $scope.logGlobalModel();

  // test User Agent
  $scope.userAgent = "Press Button!";
  $scope.checkAgent = function(){
    $scope.userAgent =  navigator.userAgent;
  };
});