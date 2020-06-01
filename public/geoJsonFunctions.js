/**
* Project:		GS I Exercise 2
* Author:     Fabian Fermazin
* Last Change:
*         by:	Fabian Fermazin
*         date: 29.04.2020
*/


/**
*@desc Function to convert a given array into a feature geojson of choice
*@param {string} ftype The desired geojson feature type
*@param {string} gtype The desired geojson geometry type
*@param {array} coordinates the coordinates for the geoJson
*@returns {geojson} gsjon a valid geojson of the desired type
*/
function toFeature(ftype,gtype,coordinates){
  var fjson;
  var geom = toGeometry(gtype,coordinates);
  switch(ftype)//checks if gytpe is geojson conform
  {
    case  "Feature":
    case  "FeatureCollection":
      fjson = {
      "type": ftype,
      "geometry": geom,
      "properties":{}//empty for now
      };
      break;
    default:
      console.warn("Only the geojson feature types Feature and FeatureCollection are acceptable.");
      break;
  }
  return fjson;
}

/**
*@desc Function to convert a given array into a geometry geojson of choice
*@param {string} gtype The desired geojson type
*@param {array} coordinates the coordinates for the geoJson
*@returns {geojson} gsjon a valid geojson of the desired type
*/
function toGeometry(gtype,coordinates){
  var gjson;
  switch(gtype)//checks if gytpe is geojson conform
  {
    case "Point":
    case "LineString":
    case "MultiPoint":
    case "MultiLineString":
    case "Polygon":
    case "MultiPolygon":
      gjson = {
      "type": gtype,
      "coordinates": coordinates
      };
      break;
    default:
      console.warn("Only the geojson geometry types Point, LineString, Polygon, Multipoint, MultiLineString and MultiPolygon are acceptable.");
      break;
  }
  return gjson;
}

/**
*@desc function that check if a given object has gjson conform geometry type attribute
*@param {json} gjson the object to be validated
*@returns {boolean}
*/
function checkType(gjson){
  switch(gjson.type){
    case "Point":
    case "LineString":
    case "MultiPoint":
    case "MultiLineString":
    case "Polygon":
    case "MultiPolygon":
      return true;
    case "Feature":
    case "FeatureCollection":
      if(gjson.properties !== undefined){ //properties check
        return checkType(gjson.geometry);
      }
      return false;
    default:
      return false;
    }
}


/**
*@desc function that check if a given object has gjson conform coordinates attribute
*@param {json} gjson the object to be validated
*@returns {boolean}
*/
function checkCoordinates(gjson){
  switch(gjson.type){
  case "Feature":
  case "FeatureCollection":
    if(Array.isArray(gjson.geometry.coordinates)){
      return true;
    }
  return false;
  default: // Geometry type get checked here
    if(Array.isArray(gjson.coordinates)){
      return true;
    }
    return false;
  }
}

/**
*@desc function that check if a given object is geojson confrom
* Checks general JSON conformity and type conformity and coordinates
*@param {string} gjson the object to be validated
*@returns {boolean}
*/
function checkGeoJson(gjson){
  try{
      var vjson = JSON.parse(gjson);//json conformity
      return [(checkType(vjson)&&checkCoordinates(vjson)),vjson.type];//geojson conformity
  }catch(e){
    return false;
  }

}

/**
*@desc Function to return the correct coordinates of geojson regardless of type
*@param {geojson} gjson The geojson of which the coordinates are needed
*@returns the coordinates in a array
*/
function getCoordinates(gjson){
  var coor;
  if(gjson.type == "Feature"||gjson.type == "FeatureCollection"){
    coor = gjson.geometry.coordinates;
  }
  else{
    coor = gjson.coordinates;
  }
  return coor;
}

function checkCoorArray(userInput){
  try{
    var arr  = JSON.parse("["+userInput+"]");
    var cLen = arr.length == 2;
    var cNum = !(isNaN(arr[0]))&&!(isNaN(arr[1]))
    return cLen&&cNum; 
  }
  catch(e){
    console.log(e);
    return false;
  }
}
