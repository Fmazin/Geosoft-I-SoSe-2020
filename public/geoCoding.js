
var mbtoken = ""; // Mapbox token here
var locations;//Saves later the JSON from Mapbox

/**
 * A function which calls the mapbox geocoding API and returns that data
 * @param {string} loc The locations which should be geocoded
 * @param {string} token The access for the mapbox API
 * @returns {ajax response} The retrived data from the Mapbox Data as Ajax response
 */
function accessMapbox(loc, token){
  var mbUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+loc+".json?access_token="+token;

  var mapboxData = $.ajax({
            url:        mbUrl,
            dataType:   "json",
            success:    console.log("Mapbox data successfully loaded."),
            error:      function (xhr) {
              seriousError("inputTable");
              console.log(xhr.statusText);
              }
          });

  return mapboxData;

}


/**
 * A function which transforms at most the first five features of a featurecollection into html <options> tags
 * @param {geojson} gjson A geojson of the 'FeatureCollection' type from the mapbox API
 * @returns {string} A string with the placenames of the first five features of gjson as html <options>
 */
function createOptions(gjson){
  var optTxt   = "",
      features = gjson.features;

  for(var i = 0; i < features.length; i++ ){
    optTxt += "<option>"+features[i].place_name+"</option>";
  }

  return optTxt;

}


/**
 * A function which makes a mapbox ajax call with the value of the geocoding input field
 * and presents the results as a drop down list on index.html.
 */
function geocodeAdress(){

  var search =  $("#geocoding").val(),
  mbdata = accessMapbox(search, mbtoken);

  $.when(mbdata).done(function(){
    locations = mbdata.responseJSON;
    console.log(locations);
    if(locations.features.length == 0){
      $("#managerError").html("Sorry no places with that name exists.");// In case of empty reply
    }
    else{
      $("#managerError").html("");//Clear Feedback
      $("#locSelect").attr("disabled",false);
      $("#locSelect").html(createOptions(locations));
    }
  });

}

/**
 * A function which takes the selected geojson feature in #locSelect and prints it into #position.
 */
function setSelect(){

  for(var i = 0; i < locations.features.length; i++){
    if($("#locSelect").val() == locations.features[i].place_name){//Find selected Feature
      $("#addName").val(locations.features[i].place_name);
      $("#addCoor").val(locations.features[i].geometry.coordinates);
    }
  }

}

/**
*@desc Function gets the geographic position of user. Copied from W3Schools
*/
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    $("#managerError") = "Geolocation is not supported by this browser.";
  }
}

/**
*@desc Function which converts the position of the user into a geojson. It is
* activated by getLocation(). At the end geojson is displayed in the position
*@param position users position to be transformed
*
*/
function showPosition(position){
  $("#addCoor").val([position.coords.longitude,position.coords.latitude]);
  $("#addName").val("I know where your house lives.");
}
