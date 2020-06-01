/**
* Project:		GS I Exercise 3
* Author:     Max Busch, Fabian Fermazin
* Last Change:
*         by:	Fabian Fermazin
*         date: 07.05.2020
*/

/**
* This document is for all functions which use coordinates in some form.
*/

/**
*@desc function that takes degrees and transforms them into radians.
*      I had to get this from W3RESOURCES because the toRadians functions from the
*      recommended was not working.
*@param degrees The degrees which are to be transformed
*@return The initial degrees in radians
*/
function toRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

/**
*@desc function that takes radians and transforms them into degrees.
*      I had to get this from W3RESOURCES because the toDegrees functions from the
*      recommended was not working.
*@param degrees The radians which are to be transformed
*@return The initial radians in degrees
*/
function toDegrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}

/**
*@desc function that takes the Latitude and Longitude of two points and calculates
*      the distance between them in meters.
*
*@param lat1 Latitude of the first point
*@param lon1 Longitude of the first point
*@param lat2 Latitude of the second point
*@param lon2 Longitude of the second point
*
*@return The distance between the two points in meters
*/
function getDistance(lat1, lon1, lat2, lon2 ) {
  //Formula from the recommended website
  var R = 6371e3; // metres
  var φ1 = toRadians(lat1);
  var φ2 = toRadians(lat2);
  var Δφ = toRadians(lat2-lat1);
  var Δλ = toRadians(lon2-lon1);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;
  return d;

}

/**
*@desc function that takes the Latitude and Longitude of two points and calculates
*      the bearing from the first point to the second.
*
*@param lat1 Latitude of the first point
*@param lon1 Longitude of the first point
*@param lat2 Latitude of the second point
*@param lon2 Longitude of the second point
*
*@return The bearing from the first point to the second in degrees
*/
function getBearing(lat1, lon1, lat2, lon2){
  //Formula from the recommended website
  var x1 = toRadians(lat1);
  var x2 = toRadians(lat2);
  var y1 = toRadians(lon1);
  var y2 = toRadians(lon2);

  var a = Math.sin(y2-y1) * Math.cos(x2);
  var b = Math.cos(x1)*Math.sin(x2) -
          Math.sin(x1)*Math.cos(x2)*Math.cos(y2-y1);
  var prebrng = toDegrees(Math.atan2(a, b));
  var brng = (prebrng+360)%360; //To get the bearing to the 360° format

  return brng;
}

/**
*@desc function which creates a sorted list of rounded distances from a point
*      to nearest 7 busstops in muenster. It also tracks extra info for the stops.
*@param singlePoint The starting point for the distance calculating. Should be
*                   pair of coordinates.
*@param pointList The position of the stations. Should be a list of
*                 coordinate pairs.
*@return A sorted List by distance of the stopnames, stopnumbers, distances in meters and bearing in cardinal direction of the clostest stop 
*/
function getDistanceList(singlePoint, pointList){
  var distanceList = [];
  distanceList[0] = [];

  for(i = 0; i < pointList.length; i++ ){
    var distance = Math.round(getDistance(singlePoint[1], singlePoint[0],pointList[i].geometry.coordinates[1],pointList[i].geometry.coordinates[0])),
        bearing  = getCardinalDir(getBearing(singlePoint[1], singlePoint[0],pointList[i].geometry.coordinates[1],pointList[i].geometry.coordinates[0]));
    var stopInfo  = getStopInfo(pointList[i]);
    distanceList[i] = [stopInfo[0], stopInfo[1], distance, bearing];
  }

  distanceList.sort(function(a,b){return a[2]-b[2];});
  
  return distanceList[0];
}

/**
*@desc function which creates a list of the bearing from a single point
*      to multiple other points.
*@param singlePoint The starting point for the bearing calculation. Should be
*                   pair of coordinates.
*@param pointList The endpoints for bearing calculation. Should be a list of
*                 coordinate pairs.
*@return A List of the bearing values in degrees from the starting point
*        to the endpoints.
*/
function getBearingList(singlePoint,pointList){
  var bearingList = [];

  for(i = 0; i < pointList.length; i++){
    bearingList[i] = getCardinalDir(getBearing(singlePoint[1], singlePoint[0], pointList[i][1], pointList[i][0]));
  }

  return bearingList;
}

/**
*@desc function which gets a bearing value in degrees(360°) and transforms it into
*      a string of the corresponding cardinal direction with 8 possiblities.
*@param bearing A bearing value in degrees(360°)
*@return A sring of the fitting cardinal direction or "Invalid" if the bearing
*        parameter is outside the 360° spectrum.
*/
function getCardinalDir(bearing){
  var cardinal;
  switch(true){
    case ((335.4<bearing && bearing <= 360) || (0<= bearing && bearing<=22.5)):
      cardinal = "N";
      break;
    case (22.5<bearing && bearing<=67.5):
      cardinal = "NE";
      break;
    case (67.5<bearing && bearing<=112.5):
      cardinal = "E";
      break;
    case (112.5<bearing && bearing<=157.5):
      cardinal = "SE";
      break;
    case (157.5<bearing && bearing<=202.5):
      cardinal = "S";
      break;
    case (202.5<bearing && bearing<=247.5):
      cardinal = "SW";
      break;
    case (247.5<bearing && bearing<=292.5):
      cardinal = "W";
      break;
    case (292.5<bearing && bearing<=337.5):
      cardinal = "NW";
      break;
    default:
      cardinal = "Invalid";
  }
  return cardinal;
}
