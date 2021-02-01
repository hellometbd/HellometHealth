const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const medicineRouter = express.Router();

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";

medicineRouter.post("/", function (req, res) {

    MongoClient.connect(connectionUrl, config, function (error, Client) {
        if (error) {
            console.log(error); 
            // console.log("uploading products meta_data to MongoDB has Failed: error: " + error);
            // res.json({ message: "Medicine upload Failed" })
            // res.end();
        } else {
            let db_medicine = Client.db("medicine");

            //uploading products meta_data....
            let collec_meta_data = db_medicine.collection("meta_data");

            let medicine_meta_data = req.body.meta_data;
            var medicine = {
                _id: "M" + Date.now(),
                meta_data: medicine_meta_data
            }

            collec_meta_data.insertOne(medicine, function(error, result){
                if (error) {
                    console.log("uploading products meta_data to MongoDB has Failed: error: " + error);
                    res.json({ message: "Medicine upload Failed" })
                    res.end();

                } else {
                    console.log("uploading products meta_data to MongoDB has successful.");
                    console.log(result);
                    res.json({ message: "Medicine upload Successfuly" })
                    res.end();
                }
            })
        }
    });
});

medicineRouter.get('/', function(req, res){

    MongoClient.connect(connectionUrl, config, function(error, Client){
        if(error){
            console.log(error);
        }else{
            let db = Client.db("medicine");
            let collec = db.collection("meta_data");
            var medicineId = req.query.id;
            if(medicineId!=null){
                var query = {_id: medicineId};
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


module.exports = medicineRouter;
