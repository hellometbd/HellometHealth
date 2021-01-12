const express = require('express');

const app = express();
const { json } = require("body-parser");
app.use(express.json());
var google = require('google')

const addMedicine = require('./addMedicine');

app.use("/medicine", addMedicine);

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var URL = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";

app.post('/addPharmacy', function(req, res){

    MongoClient.connect(URL,config, function(error, Client){
        if(error){
            console.log(error);
            res.json({ message: "Connection Failed" });
            res.end();
        }else{
            let pharmacy_meta_data = req.body;
            console.log("Connection Success.");
            console.log(pharmacy_meta_data);
            
            let db = Client.db("HellometHealth");
            let collec = db.collection("pharmacy");

            let pharmacyId = "P" + Date.now();
            // set id for every part of pharmacy data...
            let pharmacy_data = {
                _id: pharmacyId,
                meta_data: pharmacy_meta_data.meta_data
            }

        collec.insertOne(pharmacy_data, function(error, result){
            if(error){
                console.log("uploading pharmacy meta_data to MongoDB has Failed: error: " + error);
                res.json({ message: "Meta-data upload Failed" });
                res.end();
            }else{
                console.log("uploading pharmacy meta_data to MongoDB has successful.");
                res.json({ message: "Pharmacy successfully added." })
                console.log(result);
            }
        })           
        }
    });
});

app.get('/getPharmacies', function(req, res){

    MongoClient.connect(URL, config, function(error, Client){
        if(error){
            console.log(error);
        }else{
            let db = Client.db("HellometHealth");
            let collec = db.collection("pharmacy");
            var query = {};
            collec.find(query).toArray(function(error, result){
                if (error) {
                    console.log(error);
                }else{
                    res.json(result);
                    res.end();
                }
            })
        }
    })

})


app.post('/getAddressFromLatLng',function(req,res){
    const geocoder = new google.maps.Geocoder();


        let latitude = req.body.latitude;
        let longitude = req.body.longitude;
        const latlng = {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
          };

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK") {
              if (results[0]) {
               
               console.log(results[0].formatted_address);
              } else {
                window.alert("No results found");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
          });
    

});

app.get('/get',function(req, res){
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end("Success");
})


const PORT = process.env.PORT || 1010;

app.listen(1010, function(error){
    if(error){
        console.log(error);
    }else{
        console.log('Server is running on port :' + PORT);
    }

});

