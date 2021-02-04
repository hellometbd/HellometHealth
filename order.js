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
            const { pharmacy_id, pharmacy_name, pharmacy_address,pharmacy_phone_number, user_id, pharmacy_lat, pharmacy_lng,
                user_phone_number, user_name, user_address, user_lat, user_lng, requirement, total_price, status,
                payment_method, payment_status } = req.body.meta_data;

            var orderMetaData = {
                pharmacy_id,
                pharmacy_name,
                pharmacy_phone_number,
                pharmacy_address,
                pharmacy_lat,
                pharmacy_lng,   
                user_id,
                user_name,
                user_phone_number,
                user_address,
                user_lat,
                user_lng,
                requirement,
                total_price,
                status: status,
                payment_method,
                payment_status,
                created_at: Date.now(),
            }
            var order = {
                _id: generateID("O"),
                meta_data: orderMetaData,
                items: req.body.items
            }

            collecOrder.insertOne(order, function (error, result) {
                if (error) {
                    sendError(res, error);

                } else {
                    sendResult(res, "Order Place Successfuly");
                }
            })
        }
    });
})

orderRouter.get("/", function (req, res) {
    MongoClient.connect(connectionUrl, config, function (error, Client) {
        if (error) {
            sendError(res, error);

        } else {
            const dbOrder = Client.db("order");
            const collecOrder = dbOrder.collection("data");

            var { id, user_phone_number, pharmacy_phone_number } = req.query;
            var query = null;

            if (id != null) {

                query = { _id: id };
                collecOrder.findOne(query, function (error, result) {
                    if (error) {
                        sendError(res, error);
                    } else {
                        sendResult(res, result);
                    }
                });

            } else {

                if (user_phone_number != null) {
                    query = { "meta_data.user_phone_number": user_phone_number };
                    collecOrder.find(query).toArray(function (error, result) {
                        if (error) {
                            sendError(res, error);
                        } else {
                            sendResult(res, result);
                        }
                    })
                } else if (pharmacy_phone_number != null) {
                    query = { "meta_data.pharmacy_phone_number": pharmacy_phone_number };
                    collecOrder.find(query).toArray(function (error, result) {
                        if (error) {
                            sendError(res, error);
                        } else {
                            sendResult(res, result);
                        }
                    })
                } else {
                    notFoundException(res, "No Order Found!");
                }
            }
        }
    });
})


orderRouter.get("/all", function (req, res) {

    MongoClient.connect(connectionUrl, config, function (error, Client) {
        if (error) {
            sendError(res, error);

        } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");

            var query = {};
            collecOrder.find(query).toArray(function (error, result) {
                if (error) {
                    sendError(res, error);
                } else {
                    sendResult(res, result)
                }
            })
        }
    });
})


function sendError(res, error) {
    console.log(error);
    res.status(404)
    res.end();
}
function sendResult(res, result) {
    console.log(result);
    res.json(result);
    res.status(200)
    res.end();
}

function notFoundException(res, message) {
    console.log(message);
    res.json({ status: 0, message })
    res.status(404)
    res.end();

}

function generateID(type){
    var currentDateInMillisecond = Date.now();
    function prepareDate(d) {
        [d, m, y] = d.split("-"); //Split the string
        return [y, m - 1, d]; //Return as an array with y,m,d sequence
      }
      let str = "31-12-2020";
      let date2020 = new Date(...prepareDate(str));
      let currentDateInMillisecAfter2020 = currentDateInMillisecond-date2020.getTime();
      return type+currentDateInMillisecAfter2020;
}

module.exports = orderRouter;