function findPropertyInMap(type) {
  const typeActived = document.getElementById(`${type}Btn`);
  const isActived = typeActived.style.color == "red" ? true : false;

  if (isActived) {
    typeActived.style.color = "black"
    document.getElementById("right-panel").style.display = "none"

    if (type == 'transit') {
      transitLayer.setMap(null);
    } else {
      clearMarkers(type)
    }
    return
  }

  typeActived.style.color = "red"
  if (type == 'transit') {
    transitLayer.setMap(map);
    return
  }

  document.getElementById("right-panel").style.display = "block"
  let getNextPage;
  const moreButton = document.getElementById("more");

  moreButton.onclick = function () {
    moreButton.disabled = true;

    if (getNextPage) {
      getNextPage();
    }
  };
  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(
    { location: coordinatesOfMapCenter, radius: 2000, type },
    (results, status, pagination) => {
      if (status !== "OK") return;
      createMarkers(results, map, type);
      moreButton.disabled = !pagination.hasNextPage;

      if (pagination.hasNextPage) {
        getNextPage = pagination.nextPage;
      }
    }
  );
}

let markerObj = {}
function createMarkers(places, map, type) {
  const bounds = new google.maps.LatLngBounds();
  const placesList = document.getElementById("places");
  let markers = []

  for (let i = 0, place; (place = places[i]); i++) {
    const image = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25),
    };
    const marker = new google.maps.Marker({
      map,
      icon: image,
      title: place.name,
      position: place.geometry.location,
    });
    markers.push(marker)

    const li = document.createElement("li");
    li.title = place.name
    li.textContent = place.name;
    placesList.appendChild(li);
    bounds.extend(place.geometry.location);
  }
  markerObj[`${type}s`] = markers
  map.fitBounds(bounds);
}

function clearMarkers(type) {
  let markers = Object.values(markerObj)[0]
  // https://developers.google.com/maps/documentation/javascript/examples/marker-remove#maps_marker_remove-javascript
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function getLocationOfUser() {
  const gmnoprints = document.getElementsByClassName("gm-bundled-control-on-bottom")[0]
  if (!gmnoprints) {
    setTimeout(() => {
      getLocationOfUser()
    }, 500);
  } else {
    infoWindow = new google.maps.InfoWindow();
    var locationButton = document.createElement("button");
    var icon = document.createElement("i");
    icon.classList.add('fas', 'fa-location')

    locationButton.appendChild(icon);
    locationButton.classList.add('cur-location-btn')
    gmnoprints.appendChild(locationButton);

    // map.controls[google.maps.ControlPosition.TOP_CENTER].push(node);
    locationButton.addEventListener("click", () => {
      locationButton.style.color = "#1976D2"
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
