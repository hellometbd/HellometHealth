var express = require('express')
var app = express()

var http = require('http');

// respond with "hello world" when a GET request is made to the homepage
app.get('/',function(req, res){
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end("Success");
})

http.createServer(app).listen(3000);

// app.listen(function(error){
//   if (error) {
//     console.log(error);
//   }else{
//     console.log("Success");
//   }
// });