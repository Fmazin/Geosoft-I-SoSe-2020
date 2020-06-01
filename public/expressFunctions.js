var indexPositions, managementPositions;//Variables for the positions to saved for both html respectively.

//Intialisation of the visual represntation of the database on both html files
loadPositions(); 
createManagement();

/**
 * A function which makes a ajax call to the position collection.
 * @returns {ajax response} The data retrieved from the db
 */
function getPositionData(){
    var positionData = $.ajax({ //requesting a list of all positions in the database
        url:        "http://localhost:5000/position",
        dataType:   "json",
        success:    console.log("Positions data from DB successfully loaded"),
        error:      function (xhr) {
            seriousError("mapid");
            console.log(xhr.statusText);
        }
    });

    return positionData;
}

/**
 * A function which creates a list of radio input buttons on the index.html from the db. 
 * And displays it on #databaseShow.
 */
function loadPositions(){
    var positionData = getPositionData();

    $.when(positionData).done(function(){
            indexPositions   = positionData.responseJSON;
        var present     = "<h4>Choose your position:</h4><fieldset>";

        for(var i = 0; i < indexPositions.length; i++){//Creation of input radio for every  
            present += "<input type='radio' id='" + indexPositions[i]._id + "'" +
                        "onchange='showOnMap(indexPositions["+i+"])'"+
                        "name='favorites' value='" + indexPositions[i]._id+ "'>" +
                        "<label for='"+indexPositions[i]._id+"'>"+indexPositions[i].name+"</label><br>"
        }
        present+="</fieldset>"
        $("#databaseShow").html(present);
    });
}

/**
 * A function which creates a table of the departures from a busstop closest to a given position. 
 * @param {array} coordinates The coordinates of the position
 * @param {array} list A list of the busstops
 */
function printTable(coordinates, list){
    var stop = getDistanceList(coordinates, list);//Get the closest stop
    var stopapi = "https://rest.busradar.conterra.de/prod/haltestellen/"+stop[1]+"/abfahrten?sekunden=1200";

    var deparData = $.ajax({ //requesting the departures from the stop
        url:        stopapi,
        dataType:   "json",
        success:    console.log("Stop data successfully loaded."),
        error:      function (xhr) {
            seriousError("mapid");
            console.log(xhr.statusText);
        }
    });

    $.when(deparData).done(function(){
        var depars    = deparData.responseJSON,
            htmlTable = "<p style='width:250px;'>Busstop: <b>"+stop[0]+"</b> "+stop[2]+"m to the "+stop[3]+"</p>";
            htmlTable += printStop(depars);//creation of the table
            console.log(stop);
        document.getElementById("departureTable").innerHTML = htmlTable;
    });
}

/**
 * A function which creates a html table on the databaseManagement.html from the db. And updates the index of the addTable.
 * And displays it on #posManager. 
 */
function createManagement(){
    var positionData = getPositionData();

    $.when(positionData).done(function(){
        managementPositions = positionData.responseJSON;//Get Data from
        var present = "<tr><th>ID</th><th>NAME</th><th>COORDINATES</th><th>ACTIONS</th></tr>";

        for(var i = 0; i < managementPositions.length; i++){
            var idShort = managementPositions[i]._id;
            var pId     = "<td>" + idShort + "</td>";
            var pName   = "<td> <input id='" + idShort +"_name' value='"+managementPositions[i].name+"'></input></td>";
            var pCoor   = "<td> <input id='" + idShort +"_coordinates' value='"+managementPositions[i].point.coordinates+"' pattern='^-*1{0,1}[0-9]{0,1}[0-9]{1}(\\.[0-9]+)*,-*[0-9]{1,2}(\\.[0-9]+)*$'></input></td>";
            var buttons = "<td> <button onClick='updatePositions(managementPositions["+i+"])'>Update</button>" + 
                          "<button onClick='deletePositions(managementPositions["+i+"])'>Delete</button> </td>";

            present += "<tr>" + pId + pName + pCoor + buttons + "</tr>";
        }

        $("#updel").html(present); 
        $("#addId").html(getNextIndex());
    })

}

/**
 * A Function which makes a ajax call to update a given dataset. It is triggered by a button in the #posManager table. 
 * @param {Positions Dataset} dataset The dataset to be updated 
 */
function updatePositions(dataset){
    $("#managerError").html("");//Clear the Error Massage
    var nName = $("#"+dataset._id+"_name").val();
    var nCoor = $("#"+dataset._id+"_coordinates").val();

    if(nName !== "" && checkCoorArray(nCoor)){
        var request="http://localhost:5000/update?id="+dataset._id+"&name="+nName+"&coor=["+nCoor+"]"
            $.ajax({ 
                url:        request,
                success:    console.log("Update succesfull."),
                error:      function (xhr) {
                    seriousError("managerError");
                    console.log(xhr.statusText);
                }
            });
    }
    else{//Error handeling
      $("#managerError").html("Update is not acceptable. Name can not be empty and coordiantes must be GEOJSON confrom!")  
    }
    
}

/**
 * A Function which makes a ajax call to delete a given dataset. It is triggered by a button in the #posManager table. 
 * @param {Positions Dataset} dataset The dataset to be deleted 
 */
function deletePositions(dataset){
    $("#managerError").html("");
    var nName = $("#"+dataset._id+"_name").val();

    var request = "http://localhost:5000/delete?id="+dataset._id
    var delReq  = $.ajax({ 
                        url:        request,
                        success:    console.log("Update succesfull."),
                        error:      function (xhr) {
                            seriousError("managerError");
                            console.log(xhr.statusText);
                        }
                    });

    $.when(delReq).done(function(){
        createManagement(); 
    })
    
}

/**
 * A Function which makes a ajax call to add a given dataset. It is triggered by a button in the #posManager table. 
 * @param {Positions Dataset} dataset The dataset to be added 
 */
function addPositions(){
    $("#managerError").html("");
    //Get the values for the addition
    var aId   = $("#addId").html(); 
    var aName = $("#addName").val();
    var aCoor = $("#addCoor").val();

    if(aName !== "" && checkCoorArray(aCoor)){
        var request = "http://localhost:5000/add?id="+aId+"&name="+aName+"&coor=["+aCoor+"]"
        var addReq  = $.ajax({ 
                            url:        request,
                            success:    console.log("Addition succesfull."),
                            error:      function (xhr) {
                                seriousError("managerError");
                                console.log(xhr.statusText);
                        }
            });
        $.when(addReq).done(function(){
            createManagement();
            $("#addName").val("");
            $("#addCoor").val("");
        });

    }
    else{//Error handeling
        $("#managerError").html("Addition is not acceptable. Name can not be empty and coordiantes must be GEOJSON confrom!")
    }  
}

/**
 * A function which returns the last index of position plus one.
 */
function getNextIndex(){
    var posLen = managementPositions.length;
    if(posLen > 0){
    var lastId = managementPositions[posLen-1]._id;
    return lastId*1+1;
    }
    else{
        return 1; 
    }
}