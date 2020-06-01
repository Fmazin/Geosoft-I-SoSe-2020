/**
* Project:		GS I Exercise 3
* Author:     Max Busch, Fabian Fermazin
* Last Change:
*         by:	Fabian Fermazin
*         date: 07.05.2020
*/

/**
* This document is for all code that changes something on index.html
*/

/**
*@desc Function which gives feedback if the input in the textarea is
* a valid geojson
*/
function checkPosition(){
  var id,feed,check;
  id = pos;
  feed = feedbackPosition;

  check = checkGeoJson(id.value);
  if(check[0]){
    feed.style.color = "green";
    feed.innerHTML = "<b>Valid</b> "+check[1];
  }
  else{
    feed.style.color = "red";
    feed.innerHTML = "<b>Invalid</b>";
  }
}


/**
*@desc A function for displaying the final list of results. First all stops closest to the current position are displayed with distance and cardinal direction.presentation.
*It then creates new HTML div elements to later display the xhr data for the departures. It is activated from a button click.
*/
function makePresentList(){

  document.getElementById("presentation").innerHTML = ""; //clears prevoius presentation
  var gjsonPoint = JSON.parse(pos.value),
      list = stops.features;
      coorP = getCoordinates(gjsonPoint);

  var distList = getDistanceList(coorP, list);//datalist for stops  

  for(var i = 0; i< distList.length;i++ ){//creation of new html elements
    var tid  = 'tab'+i+'',
        divid = 'div'+i+'',
        text = '<p id="'+tid+'">',
        sign = "https://upload.wikimedia.org/wikipedia/commons/d/dd/Zeichen_224_-_Stra%C3%9Fenbahn-Haltestelle%2C_StVO_1970.svg;";

    text +=  "<br><img src="+sign+" class=sign><strong>"+distList[i][0]+"</strong> in "+distList[i][2]+"m"+" to the "+distList[i][3]+"<br><b>Next Departures:</b><br><div id="+divid+"></div>";
    document.getElementById("presentation").innerHTML += text+"</p>";
    getDepartures(distList[i][1], divid);//xhr call for departure data
  }
}
