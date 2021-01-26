const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const userRouter = express.Router();

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
                    console.log(result);
                    res.json({ message: "Profile set up Successfully." })
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
            var UserPhone_number = "+"+req.query.phone_number;

            var query=null;

            if (userId!=null) {
                query = {_id: userId };
            }else if(userEmail!=null){
                query = {"meta_data.email": userEmail };
            }else if(UserPhone_number!=null){
                query = {"meta_data.phone_number": UserPhone_number };
            }

            if(query!=null){
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                    }else{
                        res.json(result);
                        res.end();
                    }
                });

            }else{
                query = {};
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

});

userRouter.get("/authentication",function(req, res){

    MongoClient.connect(connectionUrl, config, function(error, Client){
        if(error){
            console.log(error);
        }else{
            let db = Client.db("user");
            let collec = db.collection("meta_data");

            var query = { 
                "meta_data.phone_number": "+"+req.query.phone_number,
                "meta_data.password": req.query.password
            }
        
                collec.findOne(query,function(error, result){
                    if (error) {
                        console.log(error);
                    }else{
                        if (result==null) {
                        res.json({ message: "No" });
                        //console.log(req.url.query);
                        res.end();
                        }else{
                            res.json({ message: "Yes" });
                            res.end();
                   //console.log(req.url.query);
                        }
                        
                    }
                });
    
        }
    });


})


module.exports = userRouter;
