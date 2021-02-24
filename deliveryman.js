const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const deliverymanRouter = express.Router();

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";

deliverymanRouter.post('/', function(req, res){
    MongoClient.connect(connectionUrl,config, function(error, Client){
        if(error){
            console.log(error);
                res.send(error);
        }else{
            let deliveryman_data = req.body;
            console.log("Connection Success.");
            console.log(deliveryman_data);
            
            let db = Client.db("delieryman");
            let collec_data = db.collection("data");
 
            let deliverymanId = "D" + Date.now();
            // set id for every part of pharmacy data...
            let deliveryman = {
                _id: deliverymanId,
                meta_data: deliveryman_data.meta_data,
                auth : deliveryman_data.auth
            }

            collec_data.insertOne(deliveryman, function(error, result){
            if(error){
                console.log("uploading deliveryman data to MongoDB has Failed: error: " + error);
                res.send(error);
                
            }else{
                    console.log("uploading deliveryman data to MongoDB has successful.");
                    console.log(result);
                    console.log(result.ops[0]);
                    res.json(result.ops[0]);
                    res.end();
                    }
        })  
        
        }
    });
});


deliverymanRouter.get('/', function(req, res){

    MongoClient.connect(connectionUrl,config, function(error, Client){
        if(error){
            console.log(error);
                res.send(error);
        }else{
            let deliveryman_data = req.body;
            console.log("Connection Success.");
            console.log(deliveryman_data);
            
            let db = Client.db("delieryman");
            let collec_data = db.collection("data");
   
        

            var deliverymanId = req.query.id;
            var phone_number = req.query.phone_number;

            if (deliverymanId!=null) {
                var query = {_id: deliverymanId};
                collec_data.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                        res.send(error)
                    }else{
                        var resultData= {
                            _id: result._id,
                            meta_data: result.meta_data
                        }
                        res.json(resultData);
                        res.end();
                    }
                });
            }
            else if (phone_number!=null) {
                var query = {"meta_data.phone_number": phone_number};
                collec_data.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                        res.send(error)
                    }else{
                        if(result==null) {
                            res.json(result);
                            res.end();
                            }else{
                                var resultData= {
                                    _id: result._id,
                                    meta_data: result.meta_data
                                }
                                res.json(resultData);
                                res.end();
                            }
                        
                    }
                });
            }
            // else{
            //     //res.setHeader('Content-Type', 'text/plain');
            //    // res.sendStatus(404);
            //     res.end();
            //    // res.status(404).end();
            //    // notFoundException(res, "Not Found.")
            // }
        }
    });
});



deliverymanRouter.get("/auth",function(req, res){

    MongoClient.connect(connectionUrl, config, function(error, Client){
        if(error){
            console.log(error);
        }else{
            let db = Client.db("deliveryman");
            let collec = db.collection("data");

            var query = { 
                "auth.phone_number": "+"+req.query.phone_number,
                "auth.password": req.query.password
            }
        
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                    }else{
                        if (result==null) {
                        res.status(404);
                        res.end();
                        }else{
                            console.log(result);
                            res.json(result);
                            res.end();
                        }
                        
                    }
                });
    
        }
    });


})


module.exports = deliverymanRouter;
