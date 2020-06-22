/**
*Setting up a leaftlet map with muenster in its center
*/
var map = L.map('heatMap').setView([51.96, 7.63], 11);
     L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(map);

/**
*Requesting all busstops in muenster as geojson  from the stadtwerke api
*/
var stopData = $.ajax({ //requesting a list of all busstops in muentser
         url:        "https://rest.busradar.conterra.de/prod/haltestellen",
         dataType:   "json",
         success:    console.log("Stop data successfully loaded."),
         error:      function (xhr) {
             seriousError("mapid");
             console.log(xhr.statusText);
           }
       });

$.when(stopData).done(function(){
   var allStops = stopData.responseJSON.features;
   var stopArray = [];
   for(var i = 0; i < allStops.length; i++){ //Transform the coordinates from geojson
     stopArray[i] = [allStops[i].geometry.coordinates[1],allStops[i].geometry.coordinates[0]];
   }
   var heat = L.heatLayer(stopArray,{radius:50}).addTo(map);//Setting up the heat layer

});
