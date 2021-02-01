const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const orderRouter = express.Router();

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";

orderRouter.post("/", function (req, res) {
    MongoClient.connect(connectionUrl, config, function (error, Client) {
        if (error) {
            console.log(error);
        } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");

            var orderMetaData = {
                pharmacy_id: req.body.meta_data.pharmacy_id,
                requirement: req.body.meta_data.requirement,
                user_lat: req.body.meta_data.user_lat,
                user_lng: req.body.meta_data.user_lng,
                user_address: req.body.meta_data.user_address,
                user_phone_number: req.body.meta_data.user_phone_number,
                total_price: req.body.meta_data.total_price,
                status: req.body.meta_data.status,
                created_at: Date.now(),
                payment_method: req.body.meta_data.payment_method,
                payment_status: req.body.meta_data.payment_status,
            }            



            var order = {
                _id: "O" + Date.now(),
                meta_data: orderMetaData,
                items: req.body.items
            }

            collecOrder.insertOne(order, function (error, result) {
                if (error) {
                    console.log("Order Placement has Failed: error: " + error);
                    // res.json({ message: "Something went wrong! Try Again." })
                    // res.statusCode(404)
                    // res.end();
           
                    res.send(error)
                    //res.status(404).send("Not found.");
                    res.status(400).send("Bad Request.");

                } else {
                    console.log("Order Placement has successful.");
                    console.log(result);
                    res.json({status:"1", message: "Order Place Successfuly" })
                    res.end();
                }
            })
        }
    });
})

orderRouter.get("/", function (req, res) {
    MongoClient.connect(connectionUrl, config, function (error, Client) {
        if (error) {
            console.log(error);
            res.json({ status:0, message: "Something went worng! Try again." })
            res.end();
            // console.log("Order Get Fail: error: " + error);
            // res.json({ message: "Something went wrong! Try Again." })
            // res.statusCode(404)
            // res.end();

        } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");


            var id = req.query.id;
            var user_phone_number = req.query.user_phone_number;
            var pharmacy_id = req.query.pharmacy_id;

            var query=null;

            if (id!=null) {

                query = {_id: id };
                collecOrder.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                        res.status(404)
                        res.json({ status:"0", message: "Something went worng! Try again." })
                        res.end();
                    }else{
                        res.json(result);
                        res.status(200)
                        res.end();
                    }
                });

            }else{

                if(user_phone_number!=null){
                    query = {"meta_data.user_phone_number": user_phone_number };
                    collecOrder.find(query).toArray(function(error, result){
                        if (error) {
                            console.log(error);
                            res.status(404)
                            res.json({ status:0, message: "Something went worng! Try again." })
                        res.end();
                        }else{
                            res.json(result);
                            res.status(200)
                            res.end();
                        }
                    })
                }else if(pharmacy_id!=null){
                    query = {"meta_data.pharmacy_id": pharmacy_id };
                    collecOrder.find(query).toArray(function(error, result){
                        if (error) {
                            console.log(error);
                            res.status(404)
                            res.json({ status:0, message: "Something went worng! Try again." })
                        res.end();
                        }else{
                            res.json(result);
                            res.status(200)
                            res.end();
                        }
                    })
                }else{
                    res.json({ status:0, message: "No Order Found!" })
                    res.status(404)
                    res.end();
                }
            }
        }
    });
})


orderRouter.get("/all", function(req, res){

    MongoClient.connect(connectionUrl, config, function (error, Client) {
        if (error) {
            console.log(error);
            res.status(404)
            res.end();
            // console.log("Order Get Fail: error: " + error);
            // res.json({ message: "Something went wrong! Try Again." })
            // res.statusCode(404)
            // res.end();

        } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");

                query = {};
                collecOrder.find(query).toArray(function(error, result){
                    if (error) {
                        console.log(error);
                        res.status(404)
                        res.end();
                    }else{
                        res.json(result);
                        res.status(200)
                        res.end();
                    }
                })
        }
    });
})

module.exports = orderRouter;