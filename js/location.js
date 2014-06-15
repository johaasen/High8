// initialize Google Places/Autocomplete controls
// for more information, see: https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete

var maps = {
  map: new google.maps.Map(document.getElementById('map-canvas'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 13,
    draggable: true,
	panControl: false,
	mapTypeControl: false,
	overviewMapControl: false,
	rotateControl: false,
	scaleControl: false,
	scrollWheel: false,
	streetViewControl: false,
	zoomControl: false
  }),
  marker: new google.maps.Marker({
	draggable: true,
    anchorPoint: new google.maps.Point(0, -29)
  }),
  infowindow: new google.maps.InfoWindow(),
  autocomplete: null,
  initializeMap: function(pos) {
  	var input = /** @type {HTMLInputElement} */(
		document.getElementById('pac-input')
  	);

  	var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
  	this.map.setCenter(position);
  	this.marker.setPosition(position);
  	this.marker.setMap(this.map);
  	this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
  	this.autocomplete = new google.maps.places.Autocomplete(input);
  	this.autocomplete.bindTo('bounds', this.map);

  	var that = this;
  	var geocoder = new google.maps.Geocoder();
  	geocoder.geocode({'latLng': position}, function(results, status) {that.onReverseGeocode(results, status);});
  	
  	$("#location-add").data({
      pos: {
	    coords: {
	  	  // k and A are the cryptic property names for the marker's latitude and longitude
	      latitude: that.marker.position.k,
		  longitude: that.marker.position.A
	    }
	  }
    });

    google.maps.event.addListener(this.autocomplete, 'place_changed', function() {that.onPlaceChanged(that.autocomplete);});
    google.maps.event.addListener(this.marker, 'dragend', function() {that.onDragEnd(that.marker);});
  },
  onPlaceChanged: function(source) {
    var place = source.getPlace();
    if (!place.geometry) {
      return;
    }

    if (place.geometry.viewport) {
      this.map.fitBounds(place.geometry.viewport);
    } else {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(17); 
    }
    
	this.marker.setPosition(place.geometry.location);
	var that = this;
	$("#location-add").data().pos.coords = {
	  // k and A are the cryptic property names for the marker's latitude and longitude
	  latitude: that.marker.position.k,
	  longitude: that.marker.position.A
	};	
	$("#location-add").data().location = {
	  name: place.name,
	  query: $("#pac-input").val(),
	  address: place.formatted_address
	};
  },
  onDragEnd: function(source) {
    var position = new google.maps.LatLng(source.position.k, source.position.A);
    var that = this;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': position}, function(results, status) {that.onReverseGeocode(results, status);});
  },
  onReverseGeocode: function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        $("#location-add").data({
      	  location: {
      	      name: "",
      		  query: "",
			  address: results[0].formatted_address
		  }
	    });
      } else {
        //alert('No results found');
      }
    } else {
      //alert('Geocoder failed due to: ' + status);
    }
  },
  initializeNearby: function(pos) {
  	var request = {
      location: pos,
      radius: 500,
      types: ['store']
    };
    
    var service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(request, this.onSearchNearby);
  },
  onSearchNearby: function (results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        this.createNearbyMarker(results[i]);
      }
    }
  },
  createNearbyMarker: function(place) {
    var placeLoc = place.geometry.location;
    var that = this;
    var marker = new google.maps.Marker({
      map: that.map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      that.infowindow.setContent(place.name);
      that.infowindow.open(that.map, this);
    });
  }
};