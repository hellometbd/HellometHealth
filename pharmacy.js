const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const pharmacyRouter = express.Router();

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";


pharmacyRouter.post('/', function(req, res){

    MongoClient.connect(connectionUrl,config, function(error, Client){
        if(error){
            console.log(error);
            res.json({ message: "Connection Failed" });
            res.end();
        }else{
            let pharmacy_meta_data = req.body;
            console.log("Connection Success.");
            console.log(pharmacy_meta_data);
            
            let db = Client.db("pharmacy");
            let collec = db.collection("meta_data");

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

pharmacyRouter.get('/', function(req, res){

    MongoClient.connect(connectionUrl, config, function(error, Client){
        if(error){
            console.log(error);
        }else{
            let db = Client.db("pharmacy");
            let collec = db.collection("meta_data");


            var pharmacyId = req.query.id;
            if(pharmacyId!=null){
                var query = {_id: pharmacyId};
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                    }else{
                        res.json(result);
                        res.end();
                    }
                });

            }else{
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
        }
    })

})

module.exports = pharmacyRouter;
