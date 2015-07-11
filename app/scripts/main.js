// // Global map variable
var map;

// // Set the center as Firebase HQ
var locations = {
  "FirebaseHQ": [6.8607396,79.9540705],
};
var center = locations["FirebaseHQ"];

// // Query radius
var radiusInKm = 2;

var firebaseRef = new Firebase("https://gayan-loction.firebaseio.com/");
var geoFire = new GeoFire(firebaseRef);


// /*************/
// /*  GEOQUERY */
// /*************/
// // Keep track of all of the vehicles currently within the query
var vehiclesInQuery = {};

geoFire.get("firebase-hq").then(function(location) {
  if (location === null) {
    // console.log("Provided key is not in GeoFire");
  }
  else {
    // console.log("Provided key has a location of " + location);
  }
}, function(error) {
  console.log("Error: " + error);
});

var geoQuery = geoFire.query({
  center: center,
  radius: radiusInKm //kilometers
});

geoQuery.on("key_entered", function(key, location, distance) {
  console.log("Bicycle shop " + key + " found at " + location + " (" + distance + " km away)");

  // Specify that the vehicle has entered this query
  vehicleId = key;
  vehiclesInQuery[vehicleId] = true;

  var vehicle = {};
  // Add the vehicle to the list of vehicles in the query
  vehiclesInQuery[vehicleId] = vehicle;


  // Create a new marker for the vehicle
  vehicle.marker = true;
  vehicle.marker = createVehicleMarker(location);

  console.log("key entered array ");
  console.log(vehiclesInQuery);
});

geoQuery.on("key_moved", function(key, location, distance) {
  console.log("(Move) Bicycle shop " + key + " found at " + location + " (" + distance + " km away)");
  var vehicle = vehiclesInQuery[key];
  // Animate the vehicle's marker
  if (typeof vehicle !== "undefined" && typeof vehicle.marker !== "undefined") {
    vehicle.marker.animatedMoveTo(location);
  }
});


// /* Removes vehicle markers from the map when they exit the query */
geoQuery.on("key_exited", function(key, location) {
  console.log("Exit...");
  vehicleId = key;
  console.log("exit key " + key);
  var vehicle = vehiclesInQuery[vehicleId];
  console.log(vehicle.marker);

  vehicle.marker.setMap(null);

  // Remove the vehicle from the list of vehicles in the query
  delete vehiclesInQuery[vehicleId];
  console.log("key entered array ");
  console.log(vehiclesInQuery);

});

// /*****************/
// /*  GOOGLE MAPS  */
// /*****************/
// /* Initializes Google Maps */
function initializeMap() {
  // Get the location as a Google Maps latitude-longitude object
  var loc = new google.maps.LatLng(center[0], center[1]);
  // Create the Google Map
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: loc,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var circle = new google.maps.Circle({
    strokeColor: "#6D3099",
    strokeOpacity: 0.7,
    strokeWeight: 1,
    fillColor: "#B650FF",
    fillOpacity: 0.35,
    map: map,
    center: loc,
    radius: ((radiusInKm) * 1000),
    draggable: true
  });

  //Update the query's criteria every time the circle is dragged
  var updateCriteria = _.debounce(function() {
    var latLng = circle.getCenter();
    geoQuery.updateCriteria({
      center: [latLng.lat(), latLng.lng()],
      radius: radiusInKm
    });
  }, 10);
  google.maps.event.addListener(circle, "drag", updateCriteria);
}



// /**********************/
// /*  HELPER FUNCTIONS  */
// /**********************/
// /* Adds a marker for the inputted vehicle to the map */
function createVehicleMarker(location) {
  console.log("map : " + map);
  console.log(map);
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(location[0], location[1]),
    optimized: true,
    map: map
  });
  marker.setMap(map);
  return marker;
}

/* Returns true if the two inputted coordinates are approximately equivalent */
function coordinatesAreEquivalent(coord1, coord2) {
  return (Math.abs(coord1 - coord2) < 0.000001);
}

/* Animates the Marker class (based on https://stackoverflow.com/a/10906464) */
google.maps.Marker.prototype.animatedMoveTo = function(newLocation) {
  var toLat = newLocation[0];
  var toLng = newLocation[1];

  var fromLat = this.getPosition().lat();
  var fromLng = this.getPosition().lng();

  if (!coordinatesAreEquivalent(fromLat, toLat) || !coordinatesAreEquivalent(fromLng, toLng)) {
    var percent = 0;
    var latDistance = toLat - fromLat;
    var lngDistance = toLng - fromLng;
    var interval = window.setInterval(function () {
      percent += 0.01;
      var curLat = fromLat + (percent * latDistance);
      var curLng = fromLng + (percent * lngDistance);
      var pos = new google.maps.LatLng(curLat, curLng);
      this.setPosition(pos);
      if (percent >= 1) {
        window.clearInterval(interval);
      }
    }.bind(this), 50);
  }
};
