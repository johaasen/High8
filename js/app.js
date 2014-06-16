var app = angular.module('Mampf-Angular', ["ngRoute", "ngTouch", "ngStorage", "mobile-angular-ui"]);

app.config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(false);
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
	}).when('/profile', {
		templateUrl : 'profile.html',
		controller  : 'profileCtrl'
	}).when('/QuickLunch', {
		templateUrl : 'QuickLunch.html',
		controller : 'quicklunchCtrl'
	}).when('/selectInvitees', {
		templateUrl : 'selectInvitees.html',
		controller : 'quicklunchCtrl'
	}).when('/addGroup', {
		templateUrl : "addGroup.html",
		controller : 'contactCtrl'
	}).when('/response', {
		templateUrl : "response.html",
		controller : 'responseCtrl'
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
			//$.getScript('js/location.js', function() {
				that.getCurrentPosition(function(pos){
					maps.initializeMap(pos);
				});
			//});
		}
	};

	return Location;
});

app.service('Config', function($localStorage) {
	// service that holds the global model and provides update functions

	// in case the "this" context is not correct
	var that = this;
	
	// bind to localStorage
	this.model = $localStorage;

	// some flags for user-settings
	this.model.isInitialized		= $localStorage.isInitialized || false;
	this.model.useGoogleContacts	= $localStorage.useGoogleContacts || false;
	this.model.useCurrentPosition	= $localStorage.useCurrentPosition || false;

	// initialize model object
	this.model.identity = $localStorage.identity || {};
		// {name: "", phone: "", id: ""}

	this.model.contacts = $localStorage.contacts || [];
		// [{ name: "", phoneNumbers: [""], id: ""}]

	this.model.groups = $localStorage.groups || [];
		// [{ groupname: "", invited : boolean, members : [{id}]}]

	this.model.requests = $localStorage.requests || [{
			currentPosition : {},		//{longitude: 0, latitude: 0}
			invitees : [],				// as MD5
			timeslots : [],				//{startTime: "", endTime: ""} in EPOCH
			response : {
				subjects : [],			// as MD5
				timeslots : {},			//{startTime: "", endTime: ""}	in EPOCH
			},
		}];


	// get API configuration object in the necessary format of specified request
	// index === 0 is the request currently in configuration
	// index === 1 is the most recently sent request
	this.getMampfAPIRequest = function(index) {
		var mampfConfig = angular.fromJson(angular.toJson(this.model.requests[index]));
		mampfConfig.identity = this.model.identity.id;
		delete mampfConfig.response;

		return mampfConfig;
	};

	// save response of a specific request in model 
	this.setResponse = function(index, response) {
		this.model.requests[index].response = angular.fromJson(angular.toJson(response));
	};

	// initialize new request
	this.newRequest = function() {
		// clone last entry to avoid object references
		var newRequest = angular.fromJson(angular.toJson(this.model.requests[0]));

		newRequest.response = {
			subjects : [],
			timeslots : {
				startTime : "",
				endTime : ""
			},
		};

		// put in first place, so that index 0 is the newest one
		this.model.requests.unshift(newRequest);
	};

	// delete all contacts
	this.delContacts = function() {
		// splice to maintain binding to local storage
		this.model.contacts.splice(0, this.model.contacts.length);
	};

	// add contact
	this.addContact = function(name, phone) {
		/*
			An array is passed if there are multiple numbers, otherwise it is a string with just one phone
			number. Only phone[0] is used for now, but for extensibility reasons an array is used as data
			structure, e.g. the phonegap API uses an array.
		*/
		if( typeof phone === 'string' ) {
			phone = [ phone ];
		}

		//check if phone number already in contacts
		if (this.getContactByPhone(phone) === undefined) {
			var contact = {
				name : name,
				phoneNumbers : phone,
				id: phoneNumberToMd5(phone[0])
			};

			this.model.contacts.push(contact);
			return true;
		} else {
			console.log("Phone number already used...");
			return false;
		}
	};

	// add a group with name and members (IDs) - array to local storage
	this.addGroup = function(name, members) {
		if( typeof members === 'string' ) {
			members = [ members ];
		}

		//check if group is already existing
		if (this.getGroupByName(name) === undefined) {
			var group = {
				name : name,
				members : members
			};

			this.model.groups.push(group);
			return true;
		} else {
			console.log("Group already existing...");
			return false;
		}
	};

	// remove an existing group
	this.remGroup = function(group) {
		var pos = this.model.groups.indexOf(group);
		if (pos > -1) {
			this.model.groups.splice(pos, 1);
			return true;
		} else {
			return false;
		}
	};

	// show contacts of a group
	this.expandGroup = function(group) {
       group.show = !group.show;
	};

	// look up the contact object by phone number
	this.getContactByPhone = function(phone) {
		// allow string or array
		if( typeof phone === 'string' ) {
			phone = [ phone ];
		}

		for (var pos in this.model.contacts) {
			if (this.model.contacts[pos].hasOwnProperty("phoneNumbers")) {
				if (this.model.contacts[pos].phoneNumbers[0] == phone[0]) {
					return this.model.contacts[pos];
				}
			}
		}
		return undefined;
	};

	// look up the contact object by ID as MD5
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

	// look up the group object by name
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

	// remove single contact from model
	this.remContact = function(contact) {
		var pos = this.model.contacts.indexOf(contact);
		if (pos > -1) {
			this.model.contacts.splice(pos, 1);
			return true;
		} else {
			return false;
		}
	};

	// set identity 
	this.setIdentity = function(name, phone) {
		this.model.identity.name = name;
		this.model.identity.phone = phone;
		this.model.identity.id = phoneNumberToMd5("" + phone);
	};

	// set position of currently configurable request
	this.setPosition = function(lat, lon) {
		this.model.requests[0].currentPosition = { "latitude": lat, "longitude": lon};
	};

	// check invitees of currently configurable request
	this.isInvitee = function(contact) {
		if(!contact){
			return;
		}
		var pos = that.model.requests[0].invitees.indexOf(contact.id);
		return (pos > -1) ? true : false;
	};

	// check if all members of a group are invited
	this.isGroupInvited = function(group) {
		//if one contact is found which is not currently invited, the whole group is not invited
		for(var pos in group.members){
			if(!(this.isInvitee(this.getContactById(group.members[pos])))){
				group.invited = false;
				return false;
			}
		}

		group.invited = true;
		return true;
	};

	// check if all contacts are invited
	this.isEvrbdyInvited = function(){
		for(var pos in this.model.contacts){
			if(!this.isInvitee(this.model.contacts[pos])){
				return false;
			}
		}
		return true;
	};

	// check if all members of all groups are invited
	this.checkGroups = function() {
		for(var pos in this.model.groups){
			this.isGroupInvited(this.model.groups[pos]);
		}
	};

	// toggle invitation status of a contact
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

	// toggle invitation status of all group members of one group
	this.toggleInviteeGroup = function(group) {
		if(group.invited){
			group.invited = false;
		}else{
			group.invited = true;
		}
		for(var con in group.members){
			contact = this.getContactById(group.members[con]);
			var pos = this.model.requests[0].invitees.indexOf(contact.id);
				if (pos > -1 ) {
					// is invitee -> remove if group is deactivated
					if(group.invited === false){
						this.model.requests[0].invitees.splice(pos,1);
					}
				} else {
					// is no invitee -> add if group is activated
					if(group.invited === true){
						this.model.requests[0].invitees.push(contact.id);
					}
				}
		}
	};

	// toggle invitation status of all contacts
	this.toggleAll = function(){
		if(this.isEvrbdyInvited()){
			for(var pos in this.model.contacts){
				this.toggleInvitee(this.model.contacts[pos]);
			}
		}
		else{
			for(var pos2 in this.model.contacts){
				if(!this.isInvitee(this.model.contacts[pos2])){
					this.toggleInvitee(this.model.contacts[pos2]);
				}
			}
		}
	};

	// get position of a timeslot in the current request
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

	// add timeslot to current request by startTime and endTime in EPOCH
	this.addTimeslot = function(startTime, endTime) {
		if(isNaN(startTime) || isNaN(endTime)){
			return;
		}

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

	// remove specific timeslot from current request
	this.remTimeslot = function(startTime, endTime) {
		if(isNaN(startTime) || isNaN(endTime)){
			return;
		}

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

	// get the n contacts that are invited most often
	this.getPopularContacts = function(n) {
		// returns an array of all once invited contacts, sorted descending by the number of invites
		var counts = {};

		// iterate over all invitees of all requests and build an object that holds all IDs and the
		// respective count of invitations
		for(var i = 1; i < this.model.requests.length; i++) {
			for(var j = 0; j < this.model.requests[i].invitees.length; j++){
				var invitee = this.model.requests[i].invitees[j];
				counts[invitee] = counts[invitee] ? counts[invitee]+1 : 1;
			}
		}
		
		// properties of the object are the IDs
		var popularIds = Object.keys(counts);

		// sort IDs by invitation count, descending
		popularIds.sort(function(a,b){
			if (counts[a] < counts[b]){
				return 1;
			}
			if (counts[a] > counts[b]){
				return -1;
			}
			return 0;
		});

		// look up contact objects of the IDs
		var popularContacts = [];
		for (i = 0; i < popularIds.length; i++) {
			popularContacts.push(this.getContactById(popularIds[i]));
		}

		// reduce to first n elements
		return popularContacts.slice(0,n);
	};

	// check if the members of all groups are valid contacts
	this.validateGroups = function() {
		// since contacts are imported, but groups are maintained in the app
		// the groups need to be validated after each import
		var tempIds = [];

		for (var i = 0; i < this.model.contacts.length; i++) {
			tempIds.push(this.model.contacts[i].id);
		}

		for (i = 0; i < this.model.groups.length; i++) {
			for (var j = 0; j < this.model.groups[i].members.length; j++) {
				if(tempIds.indexOf(this.model.groups[i].members[j]) === -1){
					this.model.groups[i].members.splice(
						this.model.groups[i].members.indexOf(this.model.groups[i].members[j]),1);
				}
			}
		}
	};

	// import contacts
	this.importContacts = function(scopeApply) {
		
		// first, empty contacts
		this.delContacts();
		var dummyContactsNeeded = true;
		
		if(navigator.contacts!==null&&navigator!==undefined){
			var that = this;						
			var onSuccess = function (contacts) {
				for(var i = 0; i < contacts.length; i++){
					var contact = contacts[i];
					for(var j = 0; j < contact.phoneNumbers; j++){
						if(contact.phoneNumbers[j].type==='mobile'){
							that.addContact(contact.displayName, contact.phoneNumbers[j].value);
						}
					}
				}
    			alert('Found ' + contacts.length + ' contacts.');
    		};

			var onError = function (contactError) {
    			alert('onError!');
			};

			// find all contacts with 'Bob' in any name field
			var options = {};
			options.multiple = true;
			options.desiredFields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.phoneNumbers];
			var fields = "*";
			navigator.contacts.find(onSuccess, onError, fields, options);
		}
		else{
			if (this.model.useGoogleContacts) {

				var that = this;
				//ClientID for Browsers
				var clientId = '68944230699-ku5i9e03505itr7a61hsf45pah3gsacc.apps.googleusercontent.com';
				if(window.location.origin===null){
					//ClientID for Smartphone
					clientID = '68944230699-fb9o103oqjuoia62ukk1sktespj2gc6p.apps.googleusercontent.com';
				}
				//Scope: Google Contacts
				var scopes = 'https://www.google.com/m8/feeds';
		
		   		window.setTimeout(checkAuth,3);
			
				function checkAuth() {
		  			gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
				}
		
				function handleAuthResult(authResult) {
		
		  			if (authResult && !authResult.error) {
		    			$.get("https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=" + authResult.access_token + "&max-results=700&v=3.0",
		      				function(response){
		         				//Handle Response
		         				for(var i = 0;i < response.feed.entry.length; i++){
		         					var contact = response.feed.entry[i];
		         					//Add all Google Contacts that have a mobile phone number defined
		         					if(contact !==null && contact!==undefined && contact.gd$phoneNumber !==null && contact.gd$phoneNumber!==undefined ){
		         						for(var j = 0; j < contact.gd$phoneNumber.length;j++){
		         							var phoneNumber = contact.gd$phoneNumber[j];
		         							if(phoneNumber.rel === "http://schemas.google.com/g/2005#mobile" && contact.gd$name && contact.gd$name.gd$fullName && contact.gd$name.gd$fullName.$t){
		         								that.addContact(contact.gd$name.gd$fullName.$t, phoneNumber.$t.replace(" ",""));
		         							}
		         						}
		         					}
		         	
		         				}
		         				//Refresh UI because changes in the model are done asynchronously
		         				that.validateGroups();
		         				if(scopeApply){scopeApply();dummyContactsNeeded = false;}
		      				});
		  			}
				}
	
			}
		}
	
		// Add Dummy Contacts for Demo
		if(dummyContactsNeeded){
			this.addContact("Julian Gimbel",	"01741111111");
			this.addContact("Jan Sosulski",	"01742222222");
			this.addContact("Johannes Haasen", "01743333333");
			this.addContact("Jonas Sladek",	"01744444444");
			this.addContact("Robert Pinsler",	"01755555555");
			this.addContact("Mike Mülhaupt",	"01746666666");
			this.addContact("Simon Liebeton",	"01747777777");
			this.addContact("Kai Sieben",		"01748888888");
		}
		this.validateGroups();
	};
});

app.controller('MainController', function($rootScope, $scope, $timeout, $location, Config) {
	// bind Config service to $rootScope, so that it is available everywhere
	$rootScope.config = Config;
	$rootScope.isLocationCustom = false;
	
	// forward to profile if app is not initialized
	$rootScope.$on('$locationChangeStart', function(event, next, curr) {
		if (!$rootScope.config.model.isInitialized) {
			$location.path('/profile');
		}
	});

	// prevent user from changing the route, as long as app is not initialized
	$rootScope.$on("$routeChangeStart", function(event, curr, prev) {
		if (!$rootScope.config.model.isInitialized && prev) {
			event.preventDefault();
			alertify.alert('Please fill in your profile first.');
		}
		
		// activate loading indicator
		$rootScope.loading = true;
	});
	
	// deactivate loading indicator
	$rootScope.$on("$routeChangeSuccess", function() {
		$rootScope.loading = false;
	});

	// backend connection for Mampf API (mampfBackendConnection.js)
	$rootScope.mampfAPI = new MampfAPI(BACKEND_URL);

	// call Mampf API and handle response
	$rootScope.findMatches = function(requestIndex, checkAgain) {
		// requestIndex specifies which request from the model should be send
		// checkAgain is an optionally injected function to evaluate the response for dependent views

		// show loading indicator
		$rootScope.loading = true;

		requestIndex = requestIndex || 0;

		$rootScope.mampfAPI.config = $rootScope.config.getMampfAPIRequest(requestIndex);
		$rootScope.mampfAPI.findMatches(function(response) {
			// save response to model
			$rootScope.config.setResponse(requestIndex, response);

			// init new request after successfull (and new) request
			if (requestIndex === 0) {
				$rootScope.config.newRequest();
			}

			// disable loading indicator
			$rootScope.loading = false;

			// switch to response view or call checkAgain function if necessary
			if ($location.$$path !== "/response") {
				$location.path("/response");
			} else if(checkAgain){
				checkAgain();
			}

			// force an update of rootScope so that views get newest values immediately
			$rootScope.$apply();
		});
	};
	
});

app.controller('quicklunchCtrl', function($rootScope, $scope, Location) {
	// bind to $scope for easier access
	$scope.contacts = $rootScope.config.model.contacts;
	$scope.popularContacts = $rootScope.config.getPopularContacts(5);
	$scope.location = Location;
	$scope.showInvitees = false;
	$scope.showLocation = false;
	$scope.showDates = true;

	$scope.showTimeList = function(){
		$scope.showDates = !$scope.showDates;
	};
	
	$scope.showList = function(){
		if($rootScope.config.model.requests[0].invitees.length>0){
			$scope.showInvitees = !$scope.showInvitees;
		}
	};
	
	$scope.showMap = function() {
		$scope.showLocation = !$scope.showLocation;
	};
	// check if the request has picked timeslots
	$scope.checkRequest = function() {
		if ($rootScope.config.model.requests[0].timeslots.length  > 0){
			//disable datepicker to pick only one date per request
			$('#form-control-date').prop('disabled', true);
			var startTimeMil = $rootScope.config.model.requests[0].timeslots[0].startTime;
			var startTime = new Date(startTimeMil);
			//set Placeholder and value
			$('#form-control-date').attr("placeholder",  ""+startTime.getDate()+"."+(startTime.getMonth()+1)+"."+startTime.getFullYear()+"" );
		}
		else{
			//enable datepicker if the request has no timslots
			$('#form-control-date').prop('disabled', false);
		}
	};

	// initilize time picker for date
	var datePicker = $('form[name="newTimeslotDate"] input[name="date"]').pickadate({
		clear: '',
		format: 'dd.mm.yyyy',
		formatSubmit: 'yyyy-mm-dd',
		hiddenName: true,
		onStart: function() {
			var date = new Date();
			if ($rootScope.config.model.requests[0].timeslots.length  > 0){
        		var startTimeMil = $rootScope.config.model.requests[0].timeslots[0].startTime;
        		var date = new Date(startTimeMil);

        		//set current date
        		this.set('select', [date.getFullYear(), date.getMonth(), date.getDate()]);
        		        	}
        	else{
        		this.set('select', [date.getFullYear(), date.getMonth(), date.getDate()]);
        	}
        	//set placeolder
        	$('#form-control-date').attr("placeholder", ""+date.getDate()+"."+(date.getMonth()+1)+"."+date.getFullYear()+"");
        	//if request has already entries
        	$scope.checkRequest();
        	//set minimum for Datepicker
        	var aktdate = new Date();
        	this.set('min', [aktdate.getFullYear(), aktdate.getMonth(), aktdate.getDate()]);

   		},
  		onSet: function(context) {
        	//var currentPick = new Date(context.select[0],context.select[1],context.select[2]);
        	//no pick option before today
        	var pickerDate = this.get('select', 'yyyy-mm-dd');
        	var aktDate = new Date();
        	var aktString = aktDate.toISOString().substr(0,10);

    	}
	});
	
	//set starttime Picker
	var startTimePicker = $('form[name="newTimeslotTime"] input[name="startTime"]').pickatime({
		clear: '',
		format: 'HH:i',
		formatSubmit: 'HH:i',
		hiddenName: true,
		onStart: function() {
			// get only 30 Minutes slots for the Timepicker
			var date = new Date();
        	this.set('select', [date.getHours(), date.getMinutes()]);
        	if(date.getMinutes()>30){
        		var minute = '00';
        		var hour = date.getHours()+1
        	}
        	else{
        		var minute = '30';
        		var hour = date.getHours();
        	}
        	//set Placehoolder
        	$('#form-control-startTime').attr("placeholder", ""+hour+":"+minute);
   		},
   		onClose: function() {
   			//set endtime one hour after the picked startdate
   			var picker = endTimePicker.pickatime('picker');
   			var hour = this.get('select','HH');
   			var minute = this.get('select','i');
   			picker.set('min', [hour,minute]);
   			var hour = (parseInt(hour)+1)%24;
   		 	picker.set('select', ""+hour+":"+minute+"", { format: 'HH:i' });
    	}

	});

	//set endtime Picker 
	var endTimePicker = 	$('form[name="newTimeslotTime"] input[name="endTime"]').pickatime({
		clear: '',
		format: 'HH:i',
		formatSubmit: 'HH:i',
		hiddenName: true,
		onStart: function() {
			var date = new Date();
        	// get only 30 Minutes slots for the Timepicker
        	this.set('select', [date.getHours() + 1, date.getMinutes()]);
        	if(date.getMinutes()>30){
        		var minute = '00';
        		var hour = date.getHours()+2
        	}
        	else{
        		var minute = '30';
        		var hour = (date.getHours()+1)%24;
        	}
        	//set Placeholder
        	$('#form-control-endTime').attr("placeholder", ""+hour+":"+minute);
   		}
	});


	$scope.setCurrentPosition = function() {
		Location.getCurrentPosition(function(pos){
			$scope.setPosition(pos);
			maps.reverseGeocode(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			$('body').data().pos = pos;
		});
	};
	
	$scope.setPosition = function(pos) {
		$rootScope.config.setPosition(pos.coords.latitude, pos.coords.longitude);
	};
	
	$scope.setNewPosition = function() {
		//console.log($('#location-add').data());
		var pos = $('body').data().pos;
		$scope.setPosition(pos);
		$scope.position = pos.coords.latitude + "," + pos.coords.longitude;
		window.location.href = '#/QuickLunch';
		$rootScope.isLocationCustom = true;
	};
	
	$scope.onCancel = function() {
		$("#pac-input").val('');
		$("#pac-input").blur();
	};
	
	$scope.setInitLocation = function() {
		if (!$rootScope.isLocationCustom) $scope.setCurrentPosition();
	};
	
	$scope.addTimeslotToRequest = function() {
		var startTime = newTimeslotTime.startTime.value;
		var endTime = newTimeslotTime.endTime.value;

		var startdate = new Date(newTimeslotDate.date.value);
		var enddate = new Date(newTimeslotDate.date.value);

		//Create startdate Date
		startdate.setHours(startTime.substr(0,startTime.indexOf(":")));
		startdate.setMinutes(startTime.substr((startTime.indexOf(":")+1),startTime.length));

		//Create endtime Date
		enddate.setHours(endTime.substr(0,endTime.indexOf(":")));
		enddate.setMinutes(endTime.substr((endTime.indexOf(":")+1),endTime.length));

		// add it to Timeslot in Milliseconds
		$rootScope.config.addTimeslot(startdate.getTime(), enddate.getTime());
	};
	
	
	$scope.sendRequest = function() {
		if($rootScope.config.model.requests[0].timeslots.length === 0){
			$scope.addTimeslotToRequest();
		}
		$rootScope.findMatches(0);
	};
	  
  	$scope.allContactsDefault = function(){
		if($rootScope.config.model.requests.length>1){
			return "inactive";
		}
		else{
			return "active";
		}
	};
});

app.controller('contactCtrl', function($rootScope, $scope, $window) {
	//reference to contacts array in local storage
	$scope.contacts = $rootScope.config.model.contacts;

	//call function importContacts
	$scope.importContacts = function(){
		$rootScope.config.importContacts($scope.$apply);
	};

	//temporary array to create groups
	var members = [];

	//Add/remove member to members array
	$scope.toggleMember = function(contact) {
		var pos = members.indexOf(contact);
		if (pos > -1) {
			members.splice(pos, 1);
		} else {
			members.push(contact);
		}
	};

	//function to sort by name
	function nameSort (a, b) {
	  if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
	};

	//Add recently configured group to the model
	$scope.addGroupToModel = function(name){
		$("input[name=groupName]").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$(this).removeClass('animated bounce');
		});

		$("ul[id=groupList]").one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				$(this).removeClass('animated shake');
		});

		//if no name is set, the input field gets animated to notify the user
		if(!name){
			$("input[name=groupName]").addClass("animated bounce");
			return false;
		}

		//if no mebers are added, the contact list gets animated to notify the user
		if(members.length<1){
			$("ul[id=groupList]").addClass("animated shake");
			return false;
		}

		//sort members alphabetically
		members.sort(nameSort);

		var memberIDs = [];

		//Add IDs of contacts to an array
		for(var pos in members){
			memberIDs.push(members[pos].id);
		}

		//Call addGroup to add this configured group to the model
		$rootScope.config.addGroup(name, memberIDs);
		//Navigate back to the previous page
		$window.history.back();
	};
	
	//Check if contact is currently selected as member
	$scope.inMembers = function (contact) {
		var pos = members.indexOf(contact);
		if (pos > -1) {
			return true;
		} else {
			return false;
		}
	};

	$scope.tabAllActivated = true;
	$scope.tabGroupsActivated = false;

	//show/hide upper right button, depending on selected tab
	$scope.toggleHiddenButton = function (tabID){
		if(tabID==='Groups'){
			$scope.tabGroupsActivated = true;
			$scope.tabAllActivated = false;
		}
		if(tabID==='All'){
			$scope.tabGroupsActivated = false;
			$scope.tabAllActivated = true;
		}
	};

});

app.controller('responseCtrl', function($rootScope, $scope, $location) {
	$rootScope.currentView = 'response';
	
	$scope.$watch('responseStatus', function(newVal, oldVal) {
	    switch (newVal) {
	        case 'invalid':
	            $location.path('/QuickLunch');
	            alertify.alert('<h1>Sorry, dude!</h1><br />Something went terribly wrong...<br />');
	            break;
	        case 'noMatch':
	            $location.path('/response');
	            alertify.alert('Jeez, aint nobody wanna eat with you!');
	            break;
	        case 'noRequest':
	            $location.path('/QuickLunch');
	            alertify.alert('Please send a request first.');
	    }
	});
	
	$scope.location = $('body').data().location;
	$scope.pos      = $('body').data().pos;
	
	// auxiliary functions to format date and time
	$scope.formatHours = function (epoch){
				var date = new Date(epoch);
				return date.getHours() + ":" + (date.getMinutes()<10?"0":"") + date.getMinutes();
			}

	$scope.formatDate = function (epoch){
				var date = new Date(epoch);
				return date.getDate() + "." + (date.getMonth()+1) + "." + date.getFullYear();
			}
	
	$scope.checkAgain = function() {
		if (!$rootScope.config.model.requests[1]) {
			// no request sent yet
			$scope.responseStatus = "noRequest";

		}else if ($rootScope.config.model.requests[1].response.subjects.length === 0){
			// response does not contain any subjects
			$scope.responseStatus = "noMatch";

		}else if(!$rootScope.config.model.requests[1].response.timeslot){
			// response contains a subject, but no timeslot
			$scope.responseStatus = "invalid";

		}else{	
			// response contains subject(s) and a timeslot
			$scope.responseStatus = "matchFound";

			// build response object from model for easier access
			$scope.response = {
				subjects: function(){
						var subjects = [];
						for (var i = 0; i < $rootScope.config.model.requests[1].response.subjects.length; i++){
							subjects.push($rootScope.config.getContactById($rootScope.config.model.requests[1].response.subjects[i]));
						}
						return subjects;
					}(),
				timeslot: {
						date: $scope.formatDate($rootScope.config.model.requests[1].response.timeslot.startTime),
						startTime: $scope.formatHours($rootScope.config.model.requests[1].response.timeslot.startTime),
						endTime: $scope.formatHours($rootScope.config.model.requests[1].response.timeslot.endTime)
					},
				location: {
					name: "",
					latitude: $rootScope.config.model.requests[1].currentPosition.latitude,
					longitude: $rootScope.config.model.requests[1].currentPosition.longitude
				}
			};
		} //if
	} //checkAgain

	$scope.checkAgain();

});

app.controller('profileCtrl', function($rootScope, $scope, $location, Config) {
	$scope.name = Config.model.identity.name;
	$scope.phone = Config.model.identity.phone;

	$scope.save = function() {
	    var name = $scope.personal.name;
		var phonenr = $scope.personal.phonenr;
		var returnValue = true;

		$(personal.name).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$(this).removeClass('animated shake');
		});

		$(personal.phonenr).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$(this).removeClass('animated shake');
		});

		// form validation
		if (!name.$modelValue) {
			$(personal.name).addClass("animated shake");
			returnValue = false;
		}
		if (phonenr.$modelValue === '' || isNaN(phonenr.$modelValue)) {
			$(personal.phonenr).addClass("animated shake");
			returnValue = false;
		}

		if (!returnValue) return false;
		
		// call config service to create MD5 and write to model
		$rootScope.config.setIdentity($scope.name, $scope.phone);
		
		// if not initialized yet
		if (!$rootScope.config.model.isInitialized) {
    		// import contacts
    		$rootScope.config.importContacts();
		    
			// set initialized flag
			$rootScope.config.model.isInitialized = true;
    
    		// route to landing screen
    		$location.path('/');
		} else {
		    // if already initialized, just show a confirmation
		    alertify.alert('Successfully saved!');
		    
		}
	}

	$scope.toggleGoogleContacts = function() {
		if ($rootScope.config.model.useGoogleContacts) {
			// trigger import from Google
			$rootScope.config.importContacts();
		} else {
			// forward to google permission-website
			window.open('https://security.google.com/settings/security/permissions');
			// and import dummy contacts
			$rootScope.config.importContacts();
		}
	}
})

/*
	// TODO: delete initialize Ctrl
app.controller('initializeCtrl', function($rootScope, $scope, $location) {
	// Mike content-for yield-to
	$rootScope.currentView = 'initialize';

	$scope.signUp = function() {
		var name = $scope.profile.name;
		var phonenr = $scope.profile.phonenr;
		var returnValue = true;
		
		$(profile.name).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$(this).removeClass('animated shake');
		});
		
		$(profile.phonenr).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
			$(this).removeClass('animated shake');
		});
		
		// dirty validation
		if (!name.$modelValue) {
			$(profile.name).addClass("animated shake");
			returnValue = false;
		}
		if (phonenr.$modelValue === '' || phonenr.$modelValue.length !== phonenr.$modelValue.match(/[0-9\+\-\/\ \#\*]/g).length) {
			$(profile.phonenr).addClass("animated shake");
			returnValue = false;
		}
		
		if (!returnValue) return false;

		// import contacts
		$rootScope.config.importContacts();

		// set identity
		$rootScope.config.setIdentity(name.$modelValue, phonenr.$modelValue);

		// set initialized flag
		$rootScope.config.model.isInitialized = true;

		// reset currentView-Marker
		$rootScope.currentView = '';

		// route to landing screen
		$location.path('/');
	};
});

*/