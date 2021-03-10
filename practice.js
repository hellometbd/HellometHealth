const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const practicRouter = express.Router();

practicRouter.get("/send", function(req, res){
    res.send({name: "Hriday", age: 21})
})
practicRouter.get("/json", function(req, res){
    res.json({name: "Hriday", age: 21})
})

practicRouter.post("/send", function(req, res){
    res.send(req.body)
})
practicRouter.get("/json", function(req, res){
    res.json(req.body)
})

module.exports = practicRouter;