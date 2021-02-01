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
                res.send(error);
        }else{
            let pharmacy_data = req.body;
            console.log("Connection Success.");
            console.log(pharmacy_data);
            
            let db = Client.db("pharmacy");
            let collec_meta_data = db.collection("meta_data");

            let pharmacyId = "P" + Date.now();
            // set id for every part of pharmacy data...
            let pharmacy_meta_data = {
                _id: pharmacyId,
                meta_data: pharmacy_data.meta_data
            }

            collec_meta_data.insertOne(pharmacy_meta_data, function(error, result){
            if(error){
                console.log("uploading pharmacy meta_data to MongoDB has Failed: error: " + error);
                res.send(error);
                
            }else{
                console.log(result);

                let collec_auth = db.collection("auth");
                let pharmacy_auth_data = {
                    _id: pharmacyId,
                    auth: pharmacy_data.auth
                }

                collec_auth.insertOne(pharmacy_auth_data, function(error, result_auth){
                    if (error) {
                        console.log("uploading pharmacy auth_data to MongoDB has Failed: error: " + error);
                        res.send(error);
                    }else{
                        console.log("uploading pharmacy meta_data to MongoDB has successful.");
                        res.json({ message: "Pharmacy successfully added." })
                        console.log(result_auth);
                    }
                })

                
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
            var phone_number = req.query.phone_number;
            if(pharmacyId!=null){
                var query = {_id: pharmacyId};
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                        res.send(error)
                    }else{
                        res.json(result);
                        res.end();
                    }
                });

            }else if(phone_number!=null){
                var query = {"meta_data.phone_number": phone_number};
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                        res.send(error)
                    }else{
                        res.json(result);
                        res.end();
                    }
                });

            }
            else{
                var query = {};
                collec.find(query).toArray(function(error, result){
                    if (error) {
                        console.log(error);
                        res.send(error)
                        //res.status(404).send("Not found.");
                        res.status(400).send("Bad Request.");
                    }else{
                        res.json(result);
                        res.end();
                    }
                })
            }
        }
    })

})

pharmacyRouter.get('/auth', function(req, res){

    MongoClient.connect(connectionUrl, config, function(error, Client){
        if(error){
            console.log(error);
        }else{
            let db = Client.db("pharmacy");
            let collec = db.collection("auth");

            var phone_number = req.query.phone_number;
            var password = req.query.password;
            if(phone_number!=null && password!= null){
                var query = {"auth.phone_number": phone_number, "auth.password": password};
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                        res.status(404).send("Not found.");
                    }else{
                        if (result!=null) {
                            res.json(result.auth);
                        res.end();
                        }else{
                            res.status(500).send("Internal Server Error.");
                        }
                    }
                });
            }else{
                res.status(500).send("Internal Server Error.");

                // res.send(error);//not checked.
                // res.status(404).send("Not found.");
                // res.status(400).send("Bad Request.");
            }
        }
    })

})



module.exports = pharmacyRouter;
