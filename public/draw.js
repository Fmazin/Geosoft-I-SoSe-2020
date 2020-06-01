var map = L.map('mapDraw').setView([51.96, 7.63], 11);
     L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
         attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(map);

//Copied from the leaflet draw documentation
// FeatureGroup is to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
    draw: {
        polygon: false,
        polyline: false,
        rectangle:false,
        circle:false,
        marker: true
    },
    edit: {
         featureGroup: drawnItems
        }
    });
map.addControl(drawControl);

/**
 * Adds a eventlistener which lets only one layer been drawn at a time. 
 * Afterwards the created layer is displayed as a Geojson in #addCoor
 */
map.on(L.Draw.Event.CREATED, function (e) {
drawnItems.clearLayers();
var layer = e.layer;
    layer.addTo(drawnItems); 
    $("#addCoor").val(layer.toGeoJSON().geometry.coordinates);

map.addLayer(layer);
});

/**
 * Adds a eventlistener which lets a updated layer be displayed at #addCoor
 */
map.on(L.Draw.Event.EDITED, function (e) {  
    var layer = e.layers;
    layer.eachLayer(function (layer) {
        layer.addTo(drawnItems);
        $("#addCoor").val(layer.toGeoJSON().geometry.coordinates);
    });      

});
