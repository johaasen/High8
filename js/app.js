var app = angular.module('Mampf-Angular', [
  "ngRoute",
  "ngTouch",
  "ngStorage",
  "mobile-angular-ui"
]);

app.config(function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(false);  //TODO effects of (true)?
  $routeProvider
		.when('/', {
			templateUrl: "home.html"
		})
		.when('/contacts', {
			templateUrl: "contacts.html"
		})
		.when('/details', {
			templateUrl: "details.html"
		})
		.when('/initialize', {
			templateUrl: 'initialize.html'
		})
		.when('/testBackend', {
			templateUrl: "testBackend.html"
		});
});

app.service('Config', function() {
  // service that holds the global model and provides update functions

  // init model object
  this.model = {
    identity: {
      //phone: "",
      //md5: ""
    },
    contacts: [
      //{
      // name: "",
      // phone: "",
      // md5: ""  
      //}
    ],
    requests: [{
      currentPosition: {
        //longitude: 0,
        //latitude: 0,
      },
      invitees: [], // as MD5
      timeslots: [
        //{
        //startTime: "",
        //endTime: ""
        //}
      ],
      response: {
        subjects: [], // as MD5
        timeslots: {
          //startTime: "",
          //endTime: ""
        },
      },
    }],
  };

  //TODO: To be discussed:
  /*
    Funktionsumfang:
    (- nur LUNCH TODAY szenario)
    - alte requests mitspeichern, in einer liste anzeigen, "check again" button
      (ansonsten muss der user sich darauf verlassen, dass der partner sich meldet)
    
    Kontakte:
    - Struktur im model (?)
    - Einmaliger "pull" des telefon-adressbuchs über phonegap
    - "flag" zur Anzeige, ob lunch-wunsch-kandidat
      - lastLunch -> default für neuen request sind die des Letzten
      - kein flag, sondern guckt immer im letzten request (requests müssten gespeichert werden)

  */

  // get API config - pass -1 as index for newest request
  this.getMampfAPIRequest = function(index){
    // should look like this
    // var demoConfig1 = {"identity":"B25BF7426FABCADF01103045FD7707CE",
    //                    "invitees":["A9B9D2ED66A5DA2AFB3247F6947F5591"],
    //                    "currentPosition":{"longitude":9.170299499999999,"latitude":48.773556600000006},
    //                    "timeslots":[{"startTime":1401621970786,"endTime":1401629170786},
    //                                 {"startTime":1401629170786,"endTime":1401636370786}]};

    if (index === -1) {
      index = this.model.requests.length - 1;
    }

    var mampfConfig = angular.fromJson(angular.toJson(this.model.requests[index]));
    mampfConfig.identity = this.model.identity.md5;
    delete mampfConfig.response;

    return mampfConfig;
  };

  this.newRequest = function() {
    // clone last entry
    var index = this.model.requests.length-1;
    var newRequest = angular.fromJson(angular.toJson(this.model.requests[index]));

    newRequest.response = {
      subjects: [],
      timeslots: {
        startTime: "",
        endTime: ""
      },
    };

    this.model.requests.push(newRequest);
  };

  // functions to update model
  this.delContacts = function() {
    this.model.contacts = [];
  };

  this.addContact = function(name, phone) {
  //check if phone no. already in contacts
	if(this.getContactByPhone(phone)===undefined){
		var contact = {
      name: name,
      phone: phone,
      md5: md5(phone).toUpperCase()
    };

    this.model.contacts.push(contact);
    return true;
	}
	else{
    //TODO: add notification: already existing contact
    console.log("Phone number already used...");
    return false;
	}
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

  //TODO: for now, only the last request can be changed with these functions
  this.setPosition = function(position) {
    this.model.requests[this.model.requests.length-1].currentPosition = position;
  };

  this.addInvitee = function(contact) {
    var pos = this.model.requests[this.model.requests.length-1].invitees.indexOf(contact.md5);
    if(pos > -1){
      return false;
    }else{
      this.model.requests[this.model.requests.length-1].invitees.push(contact.md5);
      return true;
    }
  };

  this.remInvitee = function(contact) {
    var pos = this.model.requests[this.model.requests.length-1].invitees.indexOf(contact.md5);
    if(pos > -1) {
      this.model.requests[this.model.requests.length-1].invitees.splice(pos,1);
      return true;
    }else{
      return false;
    }
  };

  this.delInvitees = function() {
    this.model.requests[this.model.requests.length-1].invitees = [];
  };

  this.delTimeslots = function() {
    this.model.requests[this.model.requests.length-1].timeslots = [];
  };

  this.getTimeslotIndex = function(timeslot) {
    // auxiliary function similar to indexOf
    var index = this.model.requests.length-1;
    for (var pos in this.model.requests[index].timeslots) {
      if (this.model.requests[index].timeslots[pos].hasOwnProperty("startTime") && this.model.requests[index].timeslots[pos].hasOwnProperty("endTime")){
        if(this.model.requests[index].timeslots[pos].startTime === timeslot.startTime && this.model.requests[index].timeslots[pos].endTime === timeslot.endTime){
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
      this.model.requests[this.model.requests.length-1].timeslots.push({"startTime": timeslot.startTime, "endTime":timeslot.endTime});
      return true;
    }
  };

  this.remTimeslot = function(timeslot) {
    var pos = this.getTimeslotIndex(timeslot);
    if(pos > -1) {
      this.model.requests[this.model.requests.length-1].timeslots.splice(pos,1);
      return true;
    }else{
      return false;
    }
  };

  //TODO: localStorage handling with ngStorage
  // init local storage
  if(typeof(Storage) != "undefined"){
    this.localStorageAvailable  = true;
  }else{
    this.localStorageAvailable = false;
  }
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
});

app.controller('MainController', function($rootScope, $scope, $timeout, $localStorage, $location, Config){

  // loading indicator on page nav
  $rootScope.$on("$routeChangeStart", function(){
    $rootScope.loading = true;
		//$rootScope.currentView = '';
  });

  $rootScope.$on("$routeChangeSuccess", function(){
    $rootScope.loading = false;
  });
	
	$rootScope.$storage = $localStorage;
  
  $scope.init = function() {
		$location.path('/initialize');
		$rootScope.currentView = 'initialize';
		$rootScope.$storage.isInitialized = false; // nach Submit auf true setzen
	};
	
	if (!$rootScope.$storage.isInitialized){
    $scope.init();
  }

  // bind Config service to $scope, so that it is available in html
  $scope.config = Config;

  // ngStorage test
  $scope.$watch('config', function() {
    $localStorage.model = $scope.config.model;
  });

  $scope.loadConfig = function(){
    $scope.config.model = $localStorage.model;
  };
	
	$scope.signUp = function() {
		$location.path('/');
		$rootScope.$storage.isInitialized = true;
		$rootScope.currentView = '';
	};

  // backend connection for Mampf API (mampfBackendConnection.js)
  $scope.mampfCon = new MampfAPI(BACKEND_URL);

  // call Mampf API 
  $scope.findMatches = function(){
    $rootScope.loading = true;

    $scope.mampfCon.config = $scope.config.getMampfAPIRequest(-1);
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

      // init new request entry after successfull call
      $scope.config.newRequest();

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
    $scope.config.addInvitee($scope.config.getContactByPhone("0175000000"));
  };

  $scope.initAsHans = function(){
    // Hans is Identity
    $scope.config.setIdentity("0175000000");
    $scope.config.addContact("Peter","0176000000");
    $scope.config.addInvitee($scope.config.getContactByPhone("0176000000"));
  };

  $scope.initAsHans();
  //$scope.initAsPeter();
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