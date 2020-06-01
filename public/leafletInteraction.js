
var mapPos,
    posCoor = [];// Variable for the position
var stopList;
var stopData = $.ajax({ //requesting a list of all busstops in muentser
          url:        "https://rest.busradar.conterra.de/prod/haltestellen",
          dataType:   "json",
          success:    console.log("Stop data successfully loaded."),
          error:      function (xhr) {
              seriousError("mapid");
              console.log(xhr.statusText);
            }
        });

var map = L.map('mapid').setView([51.962944, 7.628694], 13);
var markerGroup = L.featureGroup().addTo(map);//Setting up a marker group so the position marker does not double

$.when(stopData).done(function(){

  var i,j,
  allStops = stopData.responseJSON.features,
  stops = [];

  /**
   * A this point we reduce the total number of stops through the kbez attribute. Around 350 Stops can be cut.
   */
  for(i = 0; i < allStops.length; i++){
    if(allStops[i] !== ""){
      stops.push(allStops[i]);
      for(j = i + 1; j < allStops.length; j++){
        if(allStops[j] !== ""){
            if(allStops[i].properties.kbez == allStops[j].properties.kbez){
              var props = [stops[stops.length-1].properties, allStops[j].properties];
              stops[stops.length-1].properties = props;//Properties are stored
              allStops[j] = "";
          }
        }
      }
      }


  }

  console.log(stops);
  stopList = stops;

  //Creation of the geojson thta will be finally displayed
  var showStops = {
    type:"FeatureCollection",
    features:stops
  };


  //Setting up the map with Munester as the default view and OSM basemap

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Leaflet, OpenStreetMapContributors',
  }).addTo(map);

  L.geoJSON(showStops, {
    pointToLayer:   pointToLayer,
    onEachFeature:  onEachFeature
  }).addTo(map);

});

/**
 * A function which takes a dataset from the position db and shows its location on the map. 
 * @param {Dataset from positions} dataset 
 */
function showOnMap(dataset){
  markerGroup.clearLayers();
  var coor  = getCoordinates(dataset.point);
  mapPos = L.geoJSON(dataset.point).addTo(markerGroup).addTo(map);
  mapPos.bindPopup(dataset.name);
  posCoor = dataset.point.coordinates;
  console.log(posCoor);
  map.flyTo([coor[1],coor[0]]);
  printTable(coor,stopList)
}
