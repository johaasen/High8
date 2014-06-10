function initialize(pos) {

  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
    zoom: 13,
		panControl: false,
		draggable: true,
		mapTypeControl: false,
		overviewMapControl: false,
		rotateControl: false,
		scaleControl: false,
		scrollWheel: false,
		streetViewControl: false,
		zoomControl: false
  });

  var input = /** @type {HTMLInputElement} */(
		document.getElementById('pac-input')
	);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
		draggable: true,
    anchorPoint: new google.maps.Point(0, -29)
  });

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);  // Why 17? Because it looks good.
    }
    
		marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    //infowindow.open(map, marker);
  });
			
	// google.maps.event.addListener(marker, 'click', function() {
			// var same = false;
			// if (this.getAnimation() != null) same = true;
				// for (var i = 0, m; m = markers[i]; i++) {
					// m.setAnimation(null);
			// }
				
			// if (same != true) {
				// this.setAnimation(google.maps.Animation.BOUNCE);
				// $("#location-add").css("display","block");
				// $("#location-add").data("marker", this);
			// } else {
				// $("#location-add").css("display","none");
			// }
  // });
}