const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const pharmacyRouter = express.Router();

const mongoUtil = require('./mongoUtil')

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";


pharmacyRouter.post('/', function (req, res) {

    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         console.log(error);
    //         res.send(error);
    //     } else {
            let data = req.body;
            console.log("Connection Success.");
            console.log(data);

            let db = Client.db("pharmacy");
            let collec_data = db.collection("data");

            let pharmacyId = "P" + Date.now();
            // set id for every part of pharmacy data...
            let pharmacy_data = {
                _id: pharmacyId,
                meta_data: data.meta_data,
                auth: data.auth
            }

            collec_data.insertOne(pharmacy_data, function (error, result) {
                if (error) {
                    console.log("uploading pharmacy meta_data to MongoDB has Failed: error: " + error);
                    res.json({})
                    res.end();
                } else {
                    console.log("uploading pharmacy meta_data to MongoDB has successful.");
                    console.log(result);
                    console.log(result.ops[0]);
                    res.json(result.ops[0]);
                    res.end();
                }
            })

    //     }
    // });
});

pharmacyRouter.get('/', function (req, res) {

    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         console.log(error);
    //     } else {
            let db = Client.db("pharmacy");
            let collec = db.collection("data");

            var pharmacyId = req.query.id;
            var phone_number = req.query.phone_number;
            console.log(req.query);
            if (pharmacyId != null) {

                var query = { _id: pharmacyId };
                collec.findOne(query, function (error, result) {
                    if (error) {
                        console.log(error);
                        res.json({})
                        res.end();
                    } else {
                        res.json(result);
                        res.end();
                    }
                });

            } else if (phone_number != null) {
                var query = { "meta_data.phone_number": phone_number };
                collec.findOne(query, function (error, result) {
                    if (error) {
                        console.log(error);
                        res.json({})
                        res.end();
                    } else {
                        console.log(result);
                        res.json(result);
                        res.end();
                    }
                });

            }
            else {
                var query = {};
                collec.find(query).toArray(function (error, result) {
                    if (error) {
                        console.log(error);
                        res.json({})
                        res.end();

                    } else {
                        res.json(result);
                        res.end();
                    }
                })
            }
    //     }
    // })

})

pharmacyRouter.get('/auth', function (req, res) {

    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         console.log(error);
    //     } else {
            let db = Client.db("pharmacy");
            let collec = db.collection("data");

            var phone_number = req.query.phone_number;
            var password = req.query.password;
            if (phone_number != null && password != null) {
                var query = { "auth.phone_number": phone_number, "auth.password": password };
                collec.findOne(query, function (error, result) {
                    if (error) {
                        console.log(error);
                        res.status(404).send("Not found.");
                    } else {
                        console.log(result);

                        if (result != null) {

                            var resultData = {
                                _id: result._id,
                                meta_data: result.meta_data
                            }

                            res.json(resultData);

                            res.end();
                        } else {

                            res.status(500).send("Internal Server Error.");
                        }
                    }
                });
            } else {

                res.status(500).send("Internal Server Error.");
                // res.send(error);//not checked.
                // res.status(404).send("Not found.");
                // res.status(400).send("Bad Request.");
            }
    //     }
    // })

})

//Update Pharmacy By  ID...
pharmacyRouter.patch("/:id", function (req, res) {

    var Client = mongoUtil.getMongoClient();
    
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         console.log(error);
    //         res.status(404).send("Not found.");
    //     } else {
        let dbPharmacy = Client.db("pharmacy");
        let collecPharmacy = dbPharmacy.collection("data");
    let id = req.params.id;


    console.log(id);
    if (id != null) {

                let updatedData = req.body;


                console.log(updatedData);
                //var ObjectID = require('mongodb').ObjectID;
                //var query = {"_id": ObjectID(req.params.id)};
                let query = { "_id": id };
                var newvalues = { $set: updatedData };
                collecPharmacy.updateOne(query, newvalues, function (error, result) {
                    if (error) {
                        console.log(error);
                        res.sendStatus(404);
                        res.end();
                    } else {
                        console.log("Pharmacy Status updated");
                        console.log(result);
                        res.json(result);
                        res.end();
                    }
                })
    }
    //     }
    // });
})

module.exports = pharmacyRouter;
