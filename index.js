const express = require('express');

const app     = express();
const port    = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongodb = require('mongodb');
/**
 * The folders that are used in the express app.
 */

app.use('/public', express.static(__dirname +'/public'));
app.use('/jquery', express.static(__dirname+'/node_modules/jquery'));
app.use('/leaflet', express.static(__dirname+'/node_modules/leaflet'));
app.use('/leaflet-draw', express.static(__dirname + '/node_modules/leaflet-draw' ));
app.use('/leaflet-heat', express.static(__dirname + '/node_modules/leaflet.heat' ));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap'));

/**
* First Points to be added to the mongoDB.
*/
var startPoints = [
    {"_id":"1", "name":"GEO 1", "point":{"type":"Point", "coordinates":[7.595569,51.969404]} },
    {"_id":"2","name":"Aasee Mensa", "point":{"type": "Point","coordinates": [7.617173194885254,51.955608992749035]} },
    {"_id":"3","name":"GI Wersehaus",  "point": {"type": "Point","coordinates": [7.700222, 51.973396]}},
];

/**
 * A Function which creates a connection to the mongoDB. It creates a database called "points".
 * And calls the createPositions Function.
 */
async function connectMongoDB(){
    try{
        app.locals.dbConnection = await mongodb.MongoClient.connect("mongodb://mongodbservice:27017", {useNewUrlParser: true, useUnifiedTopology: true});
        app.locals.db = await app.locals.dbConnection.db("points"); //Creation of the database
        console.log("Using db: " + app.locals.db.databaseName);
        createPositions(app.locals.db);
    }
    catch(error){
        console.dir(error);
        setTimeout(connectMongoDB, 3000);
    }

}

/**
 * A function which creates a collection called "positions" to a choosen database and adds the startPoints to it.
 * @param {MongoDB database} db The MDB database which the positions collection should be added to
 */
function createPositions(db){
    try{
         db.createCollection('positions');
         db.collection('positions').deleteMany();//Cleans the database
         db.collection('positions').insertMany(startPoints);
    }
    catch(error){
        console.dir(error);
    }
}

connectMongoDB();


/**
 * Main Site of the App. Sends the index.html file.
 */
app.get('/',
         (req,res) => res.sendFile(__dirname + '/index.html')
);

/**
 * Database management Site. Sends the dataManagement.html file.
 */
app.get('/database',
         (req,res) => res.sendFile(__dirname + `/dataManagement.html`)
);


/**
 * A sites which shows the positions database as a JSON Array in your browser.
 */
app.get('/position', (req,res) => {
    app.locals.db.collection('positions').find({}).toArray((error, result) => {
        if(error){
            console.dir(error);
        }
        res.json(result)
    });
});

/**
 * A url where an update to the db is triggered. Takes an id, name and coordinates from the url query.
 */
app.get('/update',
         (req,res) => {
             try{
                    app.locals.db.collection('positions').updateOne(
                            { _id: req.query.id},
                            { $set: { name: req.query.name, point:{ type:"Point", coordinates: JSON.parse(req.query.coor)} }}
                        )
            }
            catch(error){
                console.dir(error);
            }
            res.send("Update complete");
        }
);

/**
 * A url where a deletion from the db is triggered. Takes an id from the url query.
 */
app.get('/delete',
         (req,res) => {
             try{
                    app.locals.db.collection('positions').deleteOne(
                            { "_id": req.query.id},
                        )
            }
            catch(error){
                console.dir(error);
            }
            res.send("Deletion complete");
        }
);

/**
 * A url where an addition to the db is triggered. Takes an id, name and coordinates from the url query.
 */
app.get('/add',
         (req,res) => {
             try{
                    app.locals.db.collection('positions').insertOne(
                            { _id: req.query.id,
                              name: req.query.name,
                              point:{ type:"Point", coordinates: JSON.parse(req.query.coor)}
                            }
                        )
            }
            catch(error){
                console.dir(error);
            }
            res.send("Update complete");
        }
);

//Port setting for app
app.listen(port,
            () => console.log('Example app listening at http://localhost:'+port));
