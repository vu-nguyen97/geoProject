const locations = [
  { id: 0, lat: 21.56391, lng: 147.154312 },
  { id: 1, lat: 20.718234, lng: 110.363181 },
  { id: 2, lat: 27.727111, lng: 110.371124 },
  { id: 3, lat: 30.848588, lng: 111.209834 },
  { id: 4, lat: 23.851702, lng: 111.216968 },
  { id: 5, lat: 21.671264, lng: 110.863657 },
  { id: 6, lat: 30.304724, lng: 118.662905 },
  { id: 7, lat: 23.817685, lng: 115.699196 },
  { id: 8, lat: 24.828611, lng: 115.790222 },
  { id: 9, lat: 24.75, lng: 145.116667 },
  { id: 10, lat: 21.759859, lng: 145.128708 },
  { id: 11, lat: 23.765015, lng: 145.133858 },
  { id: 12, lat: 20.770104, lng: 145.143299 },
  { id: 13, lat: 21.7737, lng: 145.145187 },
  { id: 14, lat: 30.774785, lng: 105.137978 },
  { id: 15, lat: 27.819616, lng: 104.968119 },
  { id: 16, lat: 21.330766, lng: 104.695692 },
  { id: 17, lat: 21.927193, lng: 105.053218 },
  { id: 18, lat: 20.330162, lng: 104.865694 },
  { id: 19, lat: 27.734358, lng: 107.439506 },
  { id: 20, lat: 30.734358, lng: 107.501315 },
  { id: 21, lat: 27.735258, lng: 107.438 },
  { id: 22, lat: 20.999792, lng: 100.463352 },
  { id: 23, lat: 21.032488, lng: 105.7825654 }
];

let map, infoWindow;
function initMap() {
  var zoom = 16
  const myLatlng = { lat: 20.99, lng: 105.823 };
  var mapOptions = {
    zoom,
    minZoom: zoom - 12,
    center: myLatlng,
  }
  map = new google.maps.Map(document.getElementById("map"), mapOptions);

  var markers = []
  locations.map(location => {
    var marker = new google.maps.Marker({
      position: location,
      map,
      title:`Location id: ${location.id}`
    });
    markers.push(marker)
  })

  // ============================================================================

  // let infoWindow2 = new google.maps.InfoWindow({
  //   content: "Click the map to get Lat/Lng!",
  //   position: myLatlng,
  // });
  // infoWindow2.open(map);
  // // Configure the click listener.
  // map.addListener("click", (mapsMouseEvent) => {
  //   // Close the current InfoWindow.
  //   infoWindow2.close();
  //   // Create a new InfoWindow.
  //   infoWindow2 = new google.maps.InfoWindow({
  //     position: mapsMouseEvent.latLng,
  //   });
  //   infoWindow2.setContent(
  //     JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
  //   );
  //   infoWindow2.open(map);
  // });

  // ============================================================================
  map.addListener('idle', function(ev){
    setTimeout(() => {
      var bounds = map.getBounds();
      var limitedLng = {
        left: bounds.Sa.i,
        right: bounds.Sa.j
      }
      var limitedLat = {
        bottom: bounds.Ya.i,
        top: bounds.Ya.j
      }

      var activedLocations = []
      activedLocations = locations.filter(location => {
        const { lat, lng } = location
        const { left, right } = limitedLng
        const { top, bottom } = limitedLat
        if (
          (lat > bottom && lat < top)
          &&
          (
            (lng > left &&  lng < right) ||
            (left > 0 && right < 0 && lng > left) ||
            (left > 0 && right < 0 && lng < right)
          )
        ) {
          // console.log(location)
          return true
        }
        return false
      })
      if (activedLocations.length == 0) {
        console.log('Notification: Could not find any location!')
      } else {
        console.log("Locations:", activedLocations.length)
      }
    }, 2000);
  });

  // ============================================================================

  // console.log(markers)
  markers.forEach(marker => {
    marker.addListener("click", () => {
      console.log('click', marker.title)
    });
  })

  // ============================================================================

  // search location
  var lat, lng
  const card = document.getElementById("pac-card");
  const input = document.getElementById("pac-input");

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
  const autocomplete = new google.maps.places.Autocomplete(input);
  // Bind the map's bounds (viewport) property to the autocomplete object,
  // so that the autocomplete requests use the current map bounds for the
  // bounds option in the request.
  autocomplete.bindTo("bounds", map);

  // Set the data fields to return when the user selects a place.
  // autocomplete.setFields(["address_components", "geometry", "icon", "name"]);
  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");
  infowindow.setContent(infowindowContent);
  const marker = new google.maps.Marker({
		map,
		anchorPoint: new google.maps.Point(0, -29),
  });
  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17); // Why 17? Because it looks good.
    }
    marker.setPosition(place.geometry.location);
    
    lat = place.geometry.location.lat();
    lng = place.geometry.location.lng();

    marker.setVisible(true);
    let address = "";

    if (place.address_components) {
      address = [
      (place.address_components[0] &&
        place.address_components[0].short_name) ||
        "",
      (place.address_components[1] &&
        place.address_components[1].short_name) ||
        "",
      (place.address_components[2] &&
        place.address_components[2].short_name) ||
        "",
      ].join(" ");
    }
    infowindowContent.children["place-icon"].src = place.icon;
    infowindowContent.children["place-name"].textContent = place.name;
    infowindowContent.children["place-address"].textContent = address;
    infowindow.open(map, marker);
  });

  // ============================================================================

  // set rectangle for project location
  const flightPlanCoordinates = [
    { lat: 21.032268423406876, lng: 105.78332182269813 },
    { lat: 21.032673992461593, lng: 105.78328427177192 },
    { lat: 21.032788971942587, lng: 105.7821631084037 },
    { lat: 21.032388410229043, lng: 105.78206654887916 },
    { lat: 21.032268423406876, lng: 105.78332182269813 },
  ];
  const lineSymbol = {
    path: "M 0,-1 0,1",
    strokeOpacity: 1,
    scale: 4,
  };
  new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 0,
    strokeWeight: 2,
    icons: [
      {
        icon: lineSymbol,
        offset: "0",
        repeat: "20px",
      },
    ],
    map: map
  });

  // ============================================================================
  // tao request search
  // https://developers.google.com/maps/documentation/javascript/reference/places-service#FindPlaceFromQueryRequest
 

  // ============================================================================

  // go to location of user
  infoWindow = new google.maps.InfoWindow();
  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);
          map.setZoom(zoom)
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}
