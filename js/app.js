var app = angular.module('Mampf-Angular', ["ngRoute", "ngTouch", "ngStorage", "mobile-angular-ui"]);

//TODO: In entsprechenden Controller kapseln
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
		controller : 'quicklunchCtrl'
	}).when('/QuickLunch', {
		templateUrl : 'QuickLunch.html',
		controller : 'quicklunchCtrl'
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
			var that = this;
			$.getScript('js/location.js', function() {
				that.getCurrentPosition(function(pos){
					initialize(pos);
				});
			});
		},
		select: function() {
			alert($("#location-add").data().marker.position);
		}
	};

	return Location;
});

app.service('Config', function($localStorage) {
	// service that holds the global model and provides update functions

	// in case this context is not correct
	var that = this;
	
  // bind to localStorage
  this.model = $localStorage;

  // initilized flag
  this.model.isInitialized = $localStorage.isInitialized || false;

	// init model object
	this.model.identity = $localStorage.identity || {};
		//{name: "", phone: "", id: ""}

  this.model.contacts = $localStorage.contacts || [];
		//[{ name: "", phone: "", id: ""}]

  this.model.groups = $localStorage.groups || [];

  this.model.requests = $localStorage.requests || [{
			currentPosition : {},	//{longitude: 0, latitude: 0}
			invitees : [],				// as MD5
			timeslots : [],				//{startTime: "", endTime: ""}
			response : {
				subjects : [],			// as MD5
				timeslots : {},			//{startTime: "", endTime: ""}
			},
		}];


	// get API config
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

	//TODO: question if contact has multiple numbers or not
	this.addContact = function(name, phone, groups) {
    if( typeof phone === 'string' ) {
      phone = [ phone ];
    }

		//check if phone no. already in contacts
		if (this.getContactByPhone(phone) === undefined) {
			var contact = {
				name : name,
				phoneNumbers : phone,
				id: phoneNumberToMd5(phone[0]),
				invited: false,
				groups: groups
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

	this.getGroupByName = function(name) {
		for (var pos in this.model.groups) {
			if (this.model.groups[pos].hasOwnProperty("name")) {
				if (this.model.groups[pos].name == name) {
					return this.model.groups[pos];
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
		this.model.requests[0].currentPosition = { "latitude": lat, "longitude": lon};
	};

  this.isInvitee = function(contact) {
		if(!contact){
			return;
		}
    var pos = that.model.requests[0].invitees.indexOf(contact.id);
	    var returnValue = (pos > -1) ? true : false;
	    if(returnValue)
	    	contact.invited=true;
	    else contact.invited=false;
    return returnValue;
  };

  this.toggleInvitee = function(contact) {
    var pos = this.model.requests[0].invitees.indexOf(contact.id);
		if (pos > -1) {
      // is invitee -> remove
      this.model.requests[0].invitees.splice(pos,1);
      contact.invited = false;
      // if invitee is removed set groups as not invited
      for(var pos in contact.groups){
      	this.getGroupByName(contact.groups[pos].value).invited = false;
    	}
			return false;
		} else {
      // is no invitee -> add
      this.model.requests[0].invitees.push(contact.id);
      		contact.invited = true;
			return true;
		}
	};

	this.toggleInviteeGroup = function(group) {
		//group.invited is instantly true after clicking the switch
		for(var con in group.contacts){
			contact = this.getContactById(group.contacts[con].id);
			var pos = this.model.requests[0].invitees.indexOf(contact.id);
				if (pos > -1 ) {
		      // is invitee -> remove if group is deactivated
					if(group.invited == false){
						this.model.requests[0].invitees.splice(pos,1);
						contact.invited = false;
					}
				} else {
		      // is no invitee -> add if group is activated
		      if(group.invited == true){
		      	this.model.requests[0].invitees.push(contact.id);
		      	contact.invited = true;
					}
				}
		}
	}

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

	this.addTimeslot = function(startTime, endTime) {
		var timeslot = {
			startTime: startTime,
			endTime: endTime
		};
		
		var pos = this.getTimeslotIndex(timeslot);
		if (pos > -1) {
			return false;
		} else {
      this.model.requests[0].timeslots.push(timeslot);
			return true;
		}
	};

	this.remTimeslot = function(startTime, endTime) {
		var timeslot = {
			startTime: startTime,
			endTime: endTime
		};

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
			// save response to model
			$rootScope.config.setResponse(requestIndex, response);

			// init new request after successfull call and save of response
			$rootScope.config.newRequest();

			$rootScope.loading = false;
			$rootScope.$apply();

			$scope.toggle("responseOverlay");
		});
	};
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
		formatSubmit: 'HH:i',
		hiddenName: true
	});
	$('form[name="newTimeslot"] input[name="endTime"]').pickatime({
		clear: '',
		format: 'HH:i',
		formatSubmit: 'HH:i',
		hiddenName: true
	});

	$scope.getCurrentPosition = function() {
		Location.getCurrentPosition(function(pos){
			$rootScope.config.setPosition(pos.coords.latitude, pos.coords.longitude);
			$rootScope.$apply();
		});
	};
	
	$scope.addTimeslotToRequest = function() {
		var date = newTimeslot.date.value;
		var startTime = newTimeslot.startTime.value;
		var endTime = newTimeslot.endTime.value;
		
    $rootScope.config.addTimeslot(Date.parse(date + ' ' + startTime), Date.parse(date + ' ' + endTime));
	};
	
	
	$scope.sendRequest = function() {
		$rootScope.mampfAPI.findMatches(function(response) {
			console.log(response);
		});
	};
});

app.controller('contactCtrl', function($rootScope, $scope) {
	//TODO: Model is not filled with contacts, they can be received only asynchronously through the onSucces of the find method.
	$scope.contacts = $rootScope.config.model.contacts;
	$scope.groups = $rootScope.config.model.groups;

	generateGroups = function() {
		var allGroupNames = [];
		for (var pos in $scope.contacts) {
			if ($scope.contacts[pos].hasOwnProperty("groups")) {
				for (var pos2 in $scope.contacts[pos].groups) {
					var name = $scope.contacts[pos].groups[pos2].value;
					var index = allGroupNames.indexOf(name);
					if(index < 0){
						allGroupNames.push(name);
						$scope.groups.push({name : name, contacts : [$scope.contacts[pos]], invited : false });
					}
					else {
						var group = $rootScope.config.getGroupByName(name);
						group.contacts.push($scope.contacts[pos]);
					}
				}
			}
		}
		console.log("Found " + allGroupNames.length + " groups.");
	};

	//cordova code copied for groups (not needed for final native app)
	var ContactField = function(type, value, pref) {
	    this.id = null;
	    this.type = (type && type.toString()) || null;
	    this.value = (value && value.toString()) || null;
	    this.pref = (typeof pref != 'undefined' ? pref : false);
	};

	$scope.importContacts = function() {
		// Zunächst alle Kontakte & Gruppen löschen
		$scope.contacts.splice(0, $scope.contacts.length);
		$scope.groups.splice(0, $scope.groups.length);

		//Mit cordova später über navigator.contacts.find() und deren success-callback function alle kontakte in scope.contacts importieren
		var studentsGroup = [
			new ContactField("group", "Students", "")
		]

		var homieGroup = [
			new ContactField("group", "Homies", ""),
			new ContactField("group", "Students", "")
		]

		var profGroup = [
			new ContactField("group", "Profs", "")
		]

		// Dummy-Kontakte anlegen
	    $rootScope.config.addContact("Mike Mülhaupt", "0170123456789", homieGroup);
	    $rootScope.config.addContact("Jo", "0170987645321", homieGroup);
	    $rootScope.config.addContact("Peter Idiot", "017000000001", studentsGroup);
	    $rootScope.config.addContact("Jörg Baumgart", "0170123123123", profGroup);
		
		generateGroups();
		// Die Contacts müssen in Model.contacts gepushed werden
		// In der navigator.contacts.find() werden die savedContacts wieder aus Model.contacts geladen
		//
		// navigator.contacts.create(contacts[i]);
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
