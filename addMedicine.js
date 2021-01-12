const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const multer = require("multer");
const router = express.Router();

var storage, path;
path = require('path');

// Include the node file module
var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var URL = "mongodb://127.0.0.1:27017/";
var config = { useUnifiedTopology: true };

storage = multer.diskStorage({
    destination: './Images/',
    filename: function (req, file, cb) {
        return cb(null, "image_" + new Date().getTime() + (path.extname(file.originalname)));
    }
});

var upload = multer({ storage: storage })

// uploading image to server hadrdisk then reference will insert to MongoDb...
router.post("/uploadImageToGenarateUrl",
    multer({
        storage: storage
    }).single('uploadImage'),
    function (req, res) {
        console.log(__dirname + "/Images/" + req.file.filename);
        var ref = { url: "hellometbd.com/Images/" + req.file.filename }
        res.json(ref);
    }
);

router.post("/addMedicine", function (req, res) {

    MongoClient.connect(URL, config, function (error, Client) {
        if (error) {
            console.log(error);
            
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
})

module.exports = router;