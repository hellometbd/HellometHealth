const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";

var client;

module.exports = {
    connetToServer : (callback) =>{
    MongoClient.connect(connectionUrl, config, function (error, Client) {
        client = Client;
        return callback(error, Client);
    })
},

getMongoClient : () =>{
    return client;
}
}


