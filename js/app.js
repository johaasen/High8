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
	}).when('/QuickLunch', {
		templateUrl : 'QuickLunch.html',
		controller : 'quicklunchCtrl'
	}).when('/testBackend', {
		templateUrl : "testBackend.html"
	}).when('/selectInvitees', {
		templateUrl : 'selectInvitees.html',
		controller : 'quicklunchCtrl'
	}).otherwise({
		redirectTo : '/QuickLunch'
	});
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
		},
		init: function() {
			$.getScript('js/location.js', function() {
				initialize();
			})
		},
		select: function() {
			alert($("#location-add").data().marker.position);
		}
	};

	return Location;
});

app.service('Config', function($localStorage) {
	// service that holds the global model and provides update functions

  // bind to localStorage
  this.model = $localStorage;

  // initilized flag
  this.model.isInitialized = $localStorage.isInitialized || false;

	// init model object
	this.model.identity = $localStorage.identity || {
      //name: "",
			//phone: "",
			//id: ""
		};

  this.model.contacts = $localStorage.contacts || [
		//{
		// name: "",
		// phone: "",
		// id: ""
		//}
		];

  this.model.requests = $localStorage.requests || [{
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
		}];


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
    if( typeof phone === 'string' ) {
      phone = [ phone ];
    }

		//check if phone no. already in contacts
		if (this.getContactByPhone(phone) === undefined) {
			var contact = {
				name : name,
				phoneNumbers : phone,
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

	this.setIdentity = function(name, phone) {
    this.model.identity.name = name;
		this.model.identity.phone = phone;
    this.model.identity.id = phoneNumberToMd5(phone);
	};

  //only the last request can be changed with these functions
	this.setPosition = function(lat, lon) {
		console.log(lat);

		this.model.requests[0].currentPosition = { "latitude": lat, "longitude": lon};
    //this.model.requests[0].currentPosition.latitude = lat;
   // this.model.requests[0].currentPosition.longitude = lon;
	};

  this.isInvitee = function(contact) {
    var pos = this.model.requests[0].invitees.indexOf(contact.id);
    return (pos > -1) ? true : false;
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

  //TODO: ändern zu starttime, endtime input parameter in EPOCH
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

app.controller('MainController', function($rootScope, $scope, $timeout, $location, Config) {

  // bind Config service to $rootScope, so that it is available everywhere
  $rootScope.config = Config;

	// loading indicator on page nav
	$rootScope.$on("$routeChangeStart", function() {
		$rootScope.loading = true;
	});

	$rootScope.$on("$routeChangeSuccess", function() {
		$rootScope.loading = false;
	});

	if (!$rootScope.config.model.isInitialized) {
    $location.path('/initialize');
  }

	// backend connection for Mampf API (mampfBackendConnection.js)
	$rootScope.mampfAPI = new MampfAPI(BACKEND_URL);

	// call Mampf API
	$rootScope.findMatches = function(requestIndex) {
		$rootScope.loading = true;

    requestIndex = requestIndex || 0;

		$rootScope.mampfAPI.config = $rootScope.config.getMampfAPIRequest(requestIndex);
		$rootScope.mampfAPI.findMatches(function(response) {
			//callback

			//testing block
			$scope.response = {};
			$scope.response.full = response;
			$scope.response.names = [];
			response.subjects.forEach(function(subject) {
				$scope.response.names.push($scope.config.getContactByMD5(subject).name);
			});
			$scope.$apply();

			//update model
			$rootScope.config.setResponse(requestIndex, response);

			// init new request entry after successfull call and save of response
			$rootScope.config.newRequest();

			$rootScope.loading = false;
			$rootScope.$apply();

			$scope.toggle("responseOverlay");
		});
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

app.controller('quicklunchCtrl', function($rootScope, $scope, Location) {
  // bind to $scope for easier access
	$scope.contacts = $rootScope.config.model.contacts;
	
  // initilize time picker
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

	$scope.getCurrentPosition = function() {
		Location.getCurrentPosition(function(pos){
			$rootScope.config.setPosition(pos.coords.latitude, pos.coords.longitude);
			$rootScope.$apply();
		});
	};

	$scope.location = Location;
	
	$scope.addTimeslotToRequest = function() {
		var date = newTimeslot.date.value;
		var startTime = newTimeslot.startTime.value;
		var endTime = newTimeslot.endTime.value;
		//TODO: convert to EPOCH + use new addTimeslot(start,end)
    $rootScope.config.addTimeslot({
			startTime: date + 'T' + startTime,
			endTime: date + 'T' + endTime
		});
	};
});

app.controller('contactCtrl', function($rootScope, $scope, Config, Model) {
	$scope.contacts = $rootScope.config.model.contacts; //TODO: Model is not filled with contacts, they can be received only asynchronously through the onSucces of the find method.

	$scope.importContacts = function() {
		// Zunächst alle Kontakte löschen
		$scope.contacts.splice(0, $scope.contacts.length);

		// Dummy-Kontakte anlegen
    $rootScope.addContact("Mike", "12234");
    $rootScope.addContact("Jo", "56789");
		
		// Die Contacts müssen in Model.contacts gepushed werden
		// In der navigator.contacts.find() werden die savedContacts wieder aus Model.contacts geladen
		//
		//navigator.contacts.create(contacts[i]);
	};
});

app.controller('initializeCtrl', function($rootScope, $scope, $location) {
  // TODO: Mike content-for yield-to
	$rootScope.currentView = 'initialize';

	$scope.signUp = function() {
		var name = $scope.profile.name;
		var phonenr = $scope.profile.phonenr;

		// dirty validation
		if (!name.$modelValue) {
			return false;
		}
		if (phonenr.$modelValue === '' || isNaN(phonenr.$modelValue)) {
			return false;
		}

		// set identity
		$rootScope.config.setIdentity(name.$modelValue, phonenr.$modelValue);

		// set initialized flag
		$rootScope.config.model.isInitialized = true;

		//TODO: reset currentView-Marker
		$rootScope.currentView = '';

		// route to landing screen
		$location.path('/');
	};
});
