var app = angular.module('Mampf-Angular', ["ngRoute", "ngTouch", "ngStorage", "mobile-angular-ui"]);

if (navigator.contacts === undefined) {
	navigator.contacts = {};

	navigator.contacts.create = function(contact) {
	//check if phone no. already in contacts
		var onSuccess = function() {
		console.log("Phone number already used...");
		};
		var onError = function() {
			var contacts = JSON.parse(localStorage.getItem("contacts"));
			if(contacts===null){
				contacts=[];
			}
			contacts.push(contact);
			localStorage.setItem("contacts", JSON.stringify(contacts));
		};
		// var contact = {
			// name : name,
			// phoneNumbers : [phone],
			// id : md5(phone).toUpperCase()
		// };
		navigator.contacts.find(onSuccess, onError, contact);
		return true;
	};

	navigator.contacts.find = function(onSuccess, onError, fields, options, filter, multiple) {
		var savedContacts = JSON.parse(localStorage.getItem("ngStorage-contacts"));
		if(savedContacts===undefined||savedContacts===null){
			onError("No contacts yet");
			return;
		}
		if (multiple === undefined) {
			multiple = false;
		}
		if (filter == "*") {
			return [].concat(savedContacts);
		};
		var contacts = [];
		if (fields.id !== undefined) {
			for (var i = 0; i < savedContacts.length; i++) {
				var contact = savedContacts[i];
				if (contact.id == fields.id) {
					contacts.push(contact);
				}
			}
			if(contacts.length==0){
				onError();
				return;
			}
			if (multiple) {
				console.log("Found Contacts: " + contacts);
				onSuccess(contacts);
				return;
			}
			console.log("Found Contact: " + contacts[0]);
			onSuccess([contacts[0]]);
			return;
		}
		if (fields.phoneNumbers !== undefined) {
			for (var i = 0; i < savedContacts.length; i++) {
				var contact = savedContacts[i];
				for (var k = 0; k < fields.phoneNumbers.length; k++) {
					for (var j = 0; j < contact.phoneNumbers.length; j++) {
						if (contact.phoneNumbers[j] == fields.phoneNumbers[k]) {
							contacts.push(contact);
							break;
						}
					}
				}
			}
			if(contacts.length==0){
				onError();
				return;
			}
			if (multiple) {
				console.log("Found Contacts: " + contacts);
				onSuccess(contacts);
				return;
			}
			console.log("Found Contact: " + contacts[0]);
			onSuccess([contacts[0]]);
			return;
		}
		if (fields.categories !== undefined) {
			for (var i = 0; i < savedContacts.length; i++) {
				var contact = savedContacts[i];
				for (var k = 0; k < fields.categories.length; k++) {
					for (var j = 0; j < contact.categories.length; j++) {
						if (contact.categories[j] == fields.categories[k]) {
							contacts.push(contact);
							break;
						}
					}
				}
			}
			if(contacts.length==0){
				onError();
				return;
			}
			if (multiple) {
				console.log("Found Contacts: " + contacts);
				onSuccess(contacts);
				return;
			}
			console.log("Found Contact: " + contacts[0]);
			onSuccess([contacts[0]]);
			return;
		}
		
	};
	//available in 
	//navigator.contacts.pickContact = function() {
	//};
}

app.config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(false);
	//TODO effects of (true)?
	$routeProvider.when('/contacts', {
		templateUrl : "contacts.html",
		controller : 'contactCtrl'
	}).when('/details', {
		templateUrl : "details.html"
	}).when('/initialize', {
		templateUrl : 'initialize.html',
		controller : 'initializeCtrl'
	}).when('/location', {
		templateUrl : 'location.html',
		controller : 'locationCtrl'
	}).when('/QuickLunch', {
		templateUrl : 'QuickLunch.html',
		controller : 'quicklunchCtrl'
	}).when('/testBackend', {
		templateUrl : "testBackend.html"
	}).otherwise({
		redirectTo : '/QuickLunch'
	});
});

app.factory('Model', function($localStorage) {
	var storage = $localStorage;

	storage.profile = $localStorage.profile || {};
	/*
	 id: 			'B25BF7426FABCADF01103045FD7707CE'
	 name: 		'Mike Mülhaupt'
	 phonenr:	'12415'
	 */
	storage.contacts = $localStorage.contacts || [];
	// Contacts compatible to cordova should have the following model:
	//https://github.com/apache/cordova-plugin-contacts/blob/master/doc/index.md#properties

	/*	[{
	 id:				'A9B9D2ED66A5DA2AFB3247F6947F5591',
	 name:			'Johannes Haasen',
	 phoneNumbers: ['01760000000','027758900'],
	 categories: ['work','university']
	 }]
	 */
	storage.requests = $localStorage.requests || [{
		invitees : [],
		position : {},
		timeslots : []
	}];
	/*	[{
	 invitees:["A9B9D2ED66A5DA2AFB3247F6947F5591"]
	 position: {
	 longitude: 9.170299499999999,
	 latitude:	 48.773556600000006
	 },
	 timeslots:[
	 {startTime:1401621970786, endTime:1401629170786},
	 {startTime:1401629170786, endTime:1401636370786}
	 ]
	 }]
	 */

	return storage;
});

app.factory('Location', function() {
	var Location = {
		locationError : function(error) {
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
					console.log("An unknown error occurred.");
					break;
			}
		},
		getCurrentPosition : function(callback) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(callback, Location.locationError);
			} else {
				console.log("Geolocation is not supported by this browser.");
			}
		}
	};

	return Location;
});

app.service('Config', function() {
	// service that holds the global model and provides update functions

	// init model object
	this.model = {
		identity : {
			//phone: "",
			//id: ""
		},
		contacts : [
		//{
		// name: "",
		// phone: "",
		// id: ""
		//}
		],
		requests : [{
			currentPosition : {
				//longitude: 0,
				//latitude: 0,
			},
			invitees : [], // as MD5
			timeslots : [
			//{
			//startTime: "",
			//endTime: ""
			//}
			],
			response : {
				subjects : [], // as MD5
				timeslots : {
					//startTime: "",
					//endTime: ""
				},
			},
		}],
	};


	// get API config - pass -1 as index for newest request
	this.getMampfAPIRequest = function(index) {
		var mampfConfig = angular.fromJson(angular.toJson(this.model.requests[index]));
		mampfConfig.identity = this.model.identity.id;
		delete mampfConfig.response;

		return mampfConfig;
	};

	this.setResponse = function(index, response) {
		this.model.requests[index].response = angular.fromJson(angular.toJson(response));
	};

	this.newRequest = function() {
		// clone last entry
    var newRequest = angular.fromJson(angular.toJson(this.model.requests[0]));

		newRequest.response = {
			subjects : [],
			timeslots : {
				startTime : "",
				endTime : ""
			},
		};

    this.model.requests.unshift(newRequest);
	};

	// functions to update model
	this.delContacts = function() {
		this.model.contacts = [];
	};

	this.addContact = function(name, phone) {
		//check if phone no. already in contacts
		if (this.getContactByPhone(phone) === undefined) {
			var contact = {
				name : name,
				phoneNumbers : [phone],
        id: phoneNumberToMd5(phone)
			};

			this.model.contacts.push(contact);
			return true;
		} else {
			console.log("Phone number already used...");
			return false;
		}
	};

	this.getContactByPhone = function(phone) {
		for (var pos in this.model.contacts) {
			if (this.model.contacts[pos].hasOwnProperty("phone")) {
				if (this.model.contacts[pos].phone == phone) {
					return this.model.contacts[pos];
				}
			}
		}
		return undefined;
	};

	this.getContactById = function(id) {
		for (var pos in this.model.contacts) {
			if (this.model.contacts[pos].hasOwnProperty("id")) {
				if (this.model.contacts[pos].id == id) {
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
		} else {
			return false;
		}
	};

	this.setIdentity = function(phone) {
		this.model.identity.phone = phone;
    this.model.identity.id = phoneNumberToMd5(phone);
	};

  //only the last request can be changed with these functions
	this.setPosition = function(position) {
    this.model.requests[0].currentPosition = position;
	};

  this.toggleInvitee = function(contact) {
    var pos = this.model.requests[0].invitees.indexOf(contact.id);
		if (pos > -1) {
      // is invitee -> remove
      this.model.requests[0].invitees.splice(pos,1);
			return false;
		} else {
      // is no invitee -> add
      this.model.requests[0].invitees.push(contact.id);
			return true;
		}
	};

	this.delInvitees = function() {
    this.model.requests[0].invitees = [];
	};

	this.delTimeslots = function() {
    this.model.requests[0].timeslots = [];
	};

	this.getTimeslotIndex = function(timeslot) {
		// auxiliary function similar to indexOf
    var index = 0;
		for (var pos in this.model.requests[index].timeslots) {
			if (this.model.requests[index].timeslots[pos].hasOwnProperty("startTime") && this.model.requests[index].timeslots[pos].hasOwnProperty("endTime")) {
				if (this.model.requests[index].timeslots[pos].startTime === timeslot.startTime && this.model.requests[index].timeslots[pos].endTime === timeslot.endTime) {
					return pos;
				}
			}
		}
		return -1;
	};

	this.addTimeslot = function(timeslot) {
		var pos = this.getTimeslotIndex(timeslot);
		if (pos > -1) {
			return false;
		} else {
      this.model.requests[0].timeslots.push({"startTime": timeslot.startTime, "endTime":timeslot.endTime});
			return true;
		}
	};

	this.remTimeslot = function(timeslot) {
		var pos = this.getTimeslotIndex(timeslot);
		if (pos > -1) {
      this.model.requests[0].timeslots.splice(pos,1);
			return true;
		} else {
			return false;
		}
	};
});

app.controller('MainController', function($rootScope, $scope, $timeout, $localStorage, $location, Config) {

	// loading indicator on page nav
	$rootScope.$on("$routeChangeStart", function() {
		$rootScope.loading = true;
	});

	$rootScope.$on("$routeChangeSuccess", function() {
		$rootScope.loading = false;
		//if ($("#location") != "undefined" && $("#location").length != 0) alert();
	});

	$rootScope.$storage = $localStorage;

	if (!$rootScope.$storage.isInitialized) {
    $location.path('/initialize');
  }

	// bind Config service to $scope, so that it is available in html
	$scope.config = Config;

	// ngStorage test
	$scope.$watch('config', function() {
		$localStorage.model = $scope.config.model;
	});

	$scope.loadConfig = function() {
		$scope.config.model = $localStorage.model;
	};

	// backend connection for Mampf API (mampfBackendConnection.js)
	$scope.mampfCon = new MampfAPI(BACKEND_URL);

	// call Mampf API
	$scope.findMatches = function(requestIndex) {
		$rootScope.loading = true;

		$scope.mampfCon.config = $scope.config.getMampfAPIRequest(requestIndex);
		$scope.mampfCon.findMatches(function(response) {
			//callback

			//testing block
			$scope.response = {};
			$scope.response.full = response;
			$scope.response.names = [];
			response.subjects.forEach(function(subject) {
				$scope.response.names.push($scope.config.getContactByMD5(subject).name);
			});
			$scope.$apply();
			console.log($scope.response);

			//update model
			$scope.config.setResponse(requestIndex, response);

			// init new request entry after successfull call and save of response
			$scope.config.newRequest();

			$rootScope.loading = false;
			$rootScope.$apply();

			$scope.toggle("responseOverlay");
		});
	};

	// **********
	// demo / test functions and demo setup follows
	// **********
	// test scope in chrome dev tools
	// var scope = angular.element($(".app-body")).scope();
	//
	$scope.logGlobalModel = function() {
		console.log($scope.config.model);
	};

	// default values for input fields
	$scope.newInvitee = "";
	$scope.newTimeslot = {};
	$scope.newTimeslot.startTime = "";
	$scope.newTimeslot.endTime = "";

	// fill model with demo values
	$scope.initAsPeter = function() {
		// Peter is Identity
		$scope.config.setIdentity("0176000000");
		$scope.config.addContact("Hans", "0175000000");
    $scope.config.toggleInvitee($scope.config.getContactByPhone("0175000000"));
		var onSuccess = function(contacts) {
			$scope.config.addInvitee(contacts[0]);
		};
		var onError = function(err) {
			console.log("Error:" + err);
		};
		var fields = {
			phoneNumbers : ["0175000000"]
		};
		navigator.contacts.find(onSuccess, onError, fields, options, filter, false);
	};

	$scope.initAsHans = function() {
		// Hans is Identity
		$scope.config.setIdentity("0175000000");
		$scope.config.addContact("Peter", "0176000000");
    $scope.config.toggleInvitee($scope.config.getContactByPhone("0176000000"));
		$scope.config.addInvitee(contacts[0]);
		var onError = function(err) {
			console.log("Error:" + err);
		};
		var fields = {
			phoneNumbers : ["0176000000"]
		};
		navigator.contacts.find(onSuccess, onError, fields, options, filter, false);
	};

	//$scope.initAsHans();
	//$scope.initAsPeter();
	$scope.config.addContact("Franz", "0174000000");
	$scope.config.setPosition({
		"longitude" : 9.170299499999999,
		"latitude" : 48.773556600000006
	});
	$scope.config.addTimeslot({
		"startTime" : 1401621970786,
		"endTime" : 1401629170786
	});
	$scope.config.addTimeslot({
		"startTime" : 1401629170786,
		"endTime" : 1401636370786
	});
	$scope.logGlobalModel();

	// test User Agent
	$scope.userAgent = "Press Button!";
	$scope.checkAgent = function() {
		$scope.userAgent = navigator.userAgent;
	};
});

app.controller('locationCtrl', function($rootScope, $scope, $localStorage, $location, Config) {

	$rootScope.currentView = 'location';

	$scope.init = function() {
		$.getScript('js/location.js', function() {
			initialize();
		});
	};

	$scope.select = function() {
		alert($("#location-add").data().marker.position);
	};

	$scope.init();
});

app.controller('quicklunchCtrl', function($rootScope, $scope, Config, Model, Location) {
	$scope.contacts = Model.contacts;

	$scope.api = new MampfAPI(BACKEND_URL);
	$scope.api.config = Model.requests[Model.requests.length - 1];
	$scope.api.config.identity = Model.profile.id;
	
	$('form[name="newTimeslot"] input[name="date"]').pickadate({
		clear: '',
		format: 'dd. mmmm',
		formatSubmit: 'yyyy-mm-dd',
		hiddenName: true
	});
	$('form[name="newTimeslot"] input[name="startTime"]').pickatime({
		clear: '',
		format: 'HH:i',
		formatSubmit: 'HH:i:00.000+02:00',
		hiddenName: true
	});
	$('form[name="newTimeslot"] input[name="endTime"]').pickatime({
		clear: '',
		format: 'HH:i',
		formatSubmit: 'HH:i:00.000+02:00',
		hiddenName: true
	});
	
	$scope.toggleContact = function(contact) {
		var index = $scope.api.config.invitees.indexOf(contact.id);
		if (index == -1)
			$scope.api.config.invitees.push(contact.id);
		else
			$scope.api.config.invitees.splice(index, 1);
	};
	
	$scope.isInvitee = function(contact) {
		if (!contact) return;
		if ($scope.api.config.invitees.indexOf(contact.id) !== -1)
			return true;
		else return false;
	};

	$scope.getCurrentPosition = Location.getCurrentPosition(function(pos) {
		$scope.api.config.position.latitude = pos.coords.latitude;
		$scope.api.config.position.longitude = pos.coords.longitude;
	});
	
	$scope.addTimeslot = function() {
		var date = newTimeslot.date.value;
		var startTime = newTimeslot.startTime.value;
		var endTime = newTimeslot.endTime.value;
		$scope.api.config.timeslots.push({
			startTime: date + 'T' + startTime,
			endTime: date + 'T' + endTime
		});
	};
});

app.controller('contactCtrl', function($rootScope, $scope, Config, Model) {
	$scope.contacts = Model.contacts; //TODO: Model is not filled with contacts, they can be received only asynchronously through the onSucces of the find method.

	$scope.importContacts = function() {
		// Zunächst alle Kontakte löschen
		$scope.contacts.splice(0, $scope.contacts.length);

		// Dummy-Kontakte anlegen
		var contacts = [{
			name : 'Mike',
			phoneNumbers : ['12234']
		}, {
			name : 'Johannes',
			phoneNumbers : ['23989']
		}];

		// Kontakte ins Model speichern
		for (i in contacts){
			contacts[i].id = phoneNumberToMd5(contacts[i].phoneNumbers[0]);
			Model.contacts.push(contacts[i]);
		}
			// Die Contacts müssen in Model.contacts gepushed werden
			// In der navigator.contacts.find() werden die savedContacts wieder aus Model.contacts geladen
			//
			//navigator.contacts.create(contacts[i]);
	};
});

app.controller('initializeCtrl', function($rootScope, $scope, $localStorage, $location, Config, Model) {

	$rootScope.$storage = $localStorage;
	$rootScope.currentView = 'initialize';

	$scope.signUp = function() {
		var name = $scope.profile.name;
		var phonenr = $scope.profile.phonenr;

		// dirty validation
		if (!name.$modelValue) {
			return false;
		}
		if (phonenr.$modelValue == '' || isNaN(phonenr.$modelValue)) {
			return false;
		}

		// set profile
		Model.profile.id = phoneNumberToMd5(phonenr.$modelValue);
		Model.profile.name = name.$modelValue;
		Model.profile.phonenr = phonenr.$modelValue;

		// set initialized flag
		$rootScope.$storage.isInitialized = true;

		// reset currentView-Marker
		$rootScope.currentView = '';

		// route to landing screen
		$location.path('/');
	};
});
