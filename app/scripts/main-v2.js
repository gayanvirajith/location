var map;
var marker;
var key;

var ref = "https://gayan-loction.firebaseio.com/";
var rootRef = new Firebase(ref);
var locationRef = rootRef.child("firebase-hq");

// /* Initializes Google Maps */
function initializeMap() {
  // Get the location as a Google Maps latitude-longitude object
  var loc = new google.maps.LatLng(6.86252, 79.95244);
  // Create the Google Map
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: loc,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  marker = createMarker(6.86252, 79.95244);

  locationRef.on("value", function(snapshot) {
    // console.log(snapshot.val());
    var location = snapshot.val();
    // console.log("lat: " +  location.l[0] + ", lng: " + location.l[1]);

    marker.animatedMoveTo(location.l);
    var latLng = marker.getPosition(); // returns LatLng object
    map.setCenter(latLng); // setCenter takes a LatLng object
  }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  });

}


/* Adds a marker for the inputted vehicle to the map */
function createMarker(lat, lon) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lon),
    optimized: true,
    map: map,
    icon: "/images/cd-icon-location.png"
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
