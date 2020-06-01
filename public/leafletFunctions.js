
//Setting up a custom icon for the stops for visual calrity
var busIcon =
    L.icon({
        iconUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Zeichen_224_-_Stra%C3%9Fenbahn-Haltestelle%2C_StVO_1970.svg",
        iconSize:[15,15]

});

/**
 * A function which calls the stadtwerke API and retrieves the departures for a specific station
 * @param {number} stopNumber the internal number of the stop
 * @returns {ajax response}the departure data as an ajax response
 */
function getDepartures(stopNumber){
  var stopapi = "https://rest.busradar.conterra.de/prod/haltestellen/"+stopNumber+"/abfahrten?sekunden=1200";

  var deparData = $.ajax({
            url:        stopapi,
            dataType:   "json",
            success:    console.log("Stop data successfully loaded."),
            error:      function (xhr) {
                seriousError("inputTable");
                console.log(xhr.statusText);
              }
          });

  return deparData;
}

/**
 * @desc A function that takes a response departure json from the stadtwerke api and turns it into a html table
 * @param {JSON} depars the deaprtures as a json from the api which shoukd be printed
 * @returns {string} A string containig the html table
 */
function printStop(depars){
  var present;
  if(depars[0] === undefined){
    present = "<p>No departures in the next 20 minutes from this stop.</p>";
  }
  else{
    depars.sort(function(a,b){return a.abfahrtszeit-b.abfahrtszeit;});
    present =     '<table class="width"><tr><th>LINE</th><th width=30px>DESTINATION</ th><th>DEPARTURE</th><th>DELAY</th></tr>';
    var linesvg = "https://muenster.nahverkehrsdaten.com/muenster_gis/10_svg/";//link to the offical svg images of the lines in muenster

        for(var i = 0; i < depars.length; i++){
            linesh  =  linedesc(depars[i].linienid);//for nightlines
            present += "<tr>" +
                 "<td>"+'<img class=line alt='+depars[i].linienid+' src='+linesvg+linesh+'.svg>' + "</td>" +
                 "<td>"+ depars[i].richtungstext + "</td>" +
                 "<td>"+ new Date (depars[i].abfahrtszeit*1000).toLocaleTimeString() + "</td>" +
                 "<td>"+ Math.round(depars[i].delay/60) + " min</td>" +
                 "</tr>";
        }
        present += "</table>";
      }
    return present;

}

/**
 * Function which desides if a busline falls under a special case (e.g. nightlines)
 * @param {number} id The number of the busline
 * @returns {string} the correct line descriptir as a string
 */
function linedesc(id){
  var ldc;
  switch(true){
    case (id<80): ldc = id; break;
    case (id>79 && id < 90): ldc = "N"+id; break;
    case (id > 99):ldc = "T" + id; break;
  }
  return ldc;
}

/**
 * Function which assigns a geojson point a leaftlet marker with the custom busicon
 * @param {geojson} geoJsonPoint The point as geojson
 * @param {Array} latlng the latitude and longitude of the the point
 * @returns a leaflet marker with the given attributes
 */
function pointToLayer(geoJsonPoint, latlng) {
    var marker = L.marker(latlng, {icon: busIcon});
    return marker;
}


/**
 * Function which adds a eventlistener to a popup. So it can show the the current departures from that stop.
 * @param {geojson} feature a feature which has the information for the popup
 * @param {*} layer the leaflet layer to which the eventlistener and popup should be binded to
 */
function onEachFeature(feature, layer){

  layer.on('click',function(e) {

    var dist = markerDistance(layer),
      bear = markerBearing(layer),
      infos     = dist + "m to the " + bear + "<br>";


    if(Array.isArray(feature.properties)){//due to the merging of stations earlier
      var popDataI   = getDepartures(feature.properties[0].nr),
          popDataII  = getDepartures(feature.properties[1].nr),
          richtungI  = "",
          richtungII = "";

          if(feature.properties[0].richtung !== undefined){
            richtungI = feature.properties[0].richtung;
          }

          if(feature.properties[1].richtung !== undefined){
            richtungII = feature.properties[1].richtung;
          }


      $.when(popDataI,popDataII).done(function(){

        layer.bindPopup("<b>"+feature.properties[0].lbez + "</b><br>" +
                        infos +
                        "<b>" + richtungI.toUpperCase()+":</b><br>" + printStop(popDataI.responseJSON) +
                        "<br><b>" + richtungII.toUpperCase()+":</b><br>" + printStop(popDataII.responseJSON));
      });
    }
    else{
      var popupData = getDepartures(feature.properties.nr),
          richtung ="";

      if(feature.properties.richtung !== undefined){
        richtung = feature.properties.richtung+":";
      }

      $.when(popupData).done(function(){
        layer.bindPopup("<b>"+feature.properties.lbez + "</b><br>" +
                        infos +
                        "<b>" + richtung.toUpperCase()+"</b><br>" +printStop(popupData.responseJSON));
      });
    }
  });
}


/**
 * Simple Function calculates distance between a leaflet layer and the current position
 * @param {leaflet layer} layer The end point of the distance calculation
 * @param {number} dist The rounded distance in m
 */
function markerDistance(layer){
  var stopCoor = layer.getLatLng(),
      dist     =  Math.round(getDistance(posCoor[1],posCoor[0],stopCoor.lat,stopCoor.lng));

  return dist;
}


/**
 * Simple Function calculates the bearing between a leaflet layer and the current position
 * @param {leaflet layer} layer The end point of the bearing calculation
 * @param {string} bear The bearing in Cardinal Direction
 */
function markerBearing(layer){
  var stopCoor = layer.getLatLng(),
      bear     =  getCardinalDir(getBearing(posCoor[1],posCoor[0],stopCoor.lat,stopCoor.lng));

  return bear;
}

/**
* Function which handels errors in case of problems with the api
* @param {string} id the html id of the element where the error message will be shown 
*/
function seriousError(id) {//not quite serious error handeling
            document.getElementById(id).style.width = "500px";
            document.getElementById(id).innerHTML = "<p class=errtxt>Something went wrong. Please reload and check your connection.</p>" +
             '<img src="https://media.giphy.com/media/ukqBV7WM4BQ4w/giphy.gif" class=error>';
        }


/**
 * A function which returns the porpteries of a given stop json from the stadtwerke api. 
 * This is necessary because of combination of stops objects earlier. 
 * @param {JSON} stop The Stop object which you want the properties of. 
 */
function getStopInfo(stop){
  var namNum = [];

  if(Array.isArray(stop.properties)){
    namNum[0] = stop.properties[0].lbez;
    namNum[1] = stop.properties[0].nr;

    return namNum;
  }
  else{
    namNum[0] = stop.properties.lbez;
    namNum[1] = stop.properties.nr;
    
    return namNum;
  }
}