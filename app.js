const express = require('express');

const app = express();
const { ifError } = require("assert");
const { json } = require("body-parser");
app.use(express.json());
var storage, path;
path = require('path');
const multer = require("multer");

const medicine = require('./medicine');
const pharmacy = require('./pharmacy');
const user = require('./user');
const order = require('./order');
const deliveryman = require('./deliveryman');
const practice = require('./practice');

app.use("/medicine", medicine);
app.use("/pharmacy", pharmacy);
app.use("/user", user);
app.use("/order", order);
app.use("/deliveryman", deliveryman);
app.use("/practice", practice);

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
res.append('Access-Control-Allow-Credentials', 'true');

    next();
});

storage = multer.diskStorage({
    destination: './Images/',
    filename: function (req, file, cb) {
        return cb(null, "image_" + new Date().getTime() + (path.extname(file.originalname)));
    }
});

var upload = multer({ storage: storage })

// uploading image to server hadrdisk then reference will insert to MongoDb...
app.post("/uploadImageToGenarateUrl",
    upload.single('uploadImage'),
    function (req, res) {
        console.log(__dirname + "/Images/" + req.file.filename);
        var ref = { url: "hellometbd.com/Images/" + req.file.filename }
        res.json(ref);
    }
);



 app.get("/Images/:imageName", (req, res) => {
    file = req.params.imageName;
  res.sendFile(path.join(__dirname, "./Images/"+file));
});

app.get('/get',function(req, res){
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end("Success");
})

//For Cpanel...
//app.listen(3000);


//For Cloud Hosting...
const PORT = process.env.PORT || 3000;
app.listen(PORT, function(error){
    if(error){
        console.log(error);
    }else{
        console.log('Server is running on port :' + PORT);
    }
});

