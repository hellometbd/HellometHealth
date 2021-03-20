const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const userRouter = express.Router();
const mongoUtil = require('./mongoUtil')

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";

userRouter.post("/profile", function (req, res) {

    MongoClient.connect(connectionUrl, config, function (error, Client) {
        if (error) {
            console.log(error); 
        } else {
            let db_user = Client.db("user");

            //uploading products meta_data....
            let collec_meta_data = db_user.collection("meta_data");

            let user_meta_data = req.body.meta_data;
            var user = {
                _id: "U" + Date.now(),
                meta_data: user_meta_data
            }

            collec_meta_data.insertOne(user, function(error, result){
                if (error) {
                    console.log("uploading user meta_data to MongoDB has Failed: error: " + error);
                    res.json({ message: "Profile set up Failed, Try Again!" })
                    res.end();

                } else {
                    console.log("uploading user meta_data to MongoDB has successful.");
                    console.log(result.ops[0]);
                    res.json(result.ops[0]);
                    res.end();
                }
            })
        }
    });
});

userRouter.get('/profile', function(req, res){

    MongoClient.connect(connectionUrl, config, function(error, Client){
        if(error){
            console.log(error);
        }else{
            let db = Client.db("user");
            let collec = db.collection("meta_data");
            var userId = req.query.id;
            var userEmail = req.query.email;
            var UserPhone_number = req.query.phone_number;

            var query=null;

            if (userId!=null) {
                query = {_id: userId };
            }else if(userEmail!=null){
                query = {"meta_data.email": userEmail };
            }else if(UserPhone_number!=null){
                query = {"meta_data.phone_number": UserPhone_number };
            }

            if(query!=null){
                console.log(req.query);
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                        res.json({})
                        res.end();
                    }else{
                        console.log(result);
                        res.json(result);
                        res.end();
                    }
                });

            }else{
                query = {};
                collec.find(query).toArray(function(error, result){
                    if (error) {
                        console.log(error);
                        res.json({})
                        res.end();
                    }else{
                        res.json(result);
                        res.end();
                    }
                })
            }
        }
    })

});

userRouter.get("/authentication",function(req, res){

    MongoClient.connect(connectionUrl, config, function(error, Client){
        if(error){
            console.log(error);
            res.json({});
            res.end();
        }else{
            let db = Client.db("user");
            let collec = db.collection("meta_data");

            var query = { 
                "meta_data.phone_number": req.query.phone_number,
                "meta_data.password": req.query.password
            }
        console.log(req.query);
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                    }else{
                            console.log(result);
                            res.json(result);
                            res.end();
                    }
                });
    
        }
    });


})


module.exports = userRouter;
