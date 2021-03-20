const { ifError } = require("assert");

const { json } = require("body-parser");
var express = require("express");
const orderRouter = express.Router();

var MongoClient = require('mongodb').MongoClient;
var config = { useUnifiedTopology: true };
const mongoUtil = require('./mongoUtil')

var connectionUrl = "mongodb+srv://hellomethealth:hellomethealth@cluster0.vrnxz.mongodb.net?retryWrites=true&w=majority";

orderRouter.post("/", function (req, res) {
    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         console.log(error);
    //     } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");
            const { pharmacy_id, pharmacy_name, pharmacy_address, pharmacy_phone_number, user_id, pharmacy_lat, pharmacy_lng,
                user_phone_number, user_name, user_address, user_lat, user_lng, deliveryman_id, deliveryman_name, deliveryman_phone_number,
                requirement, total_price, status, payment_method, payment_status } = req.body.meta_data;

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
                deliveryman_id,
                deliveryman_name,
                deliveryman_phone_number,
                requirement,
                total_price,
                status,
                payment_method,
                payment_status,
                created_at: Date.now(),
            }
            var prescriptionImageUrls = req.body.prescriptionImageUrls;
            var items = req.body.items;
            var order;
            if (prescriptionImageUrls) {
                order = {
                    _id: generateID("O"),
                    meta_data: orderMetaData,
                    prescriptionImageUrls: prescriptionImageUrls,
                }
            } else if (items) {
                order = {
                    _id: generateID("O"),
                    meta_data: orderMetaData,
                    items: items,
                }
            }

            console.log(order);
            collecOrder.insertOne(order, function (error, result) {
                if (error) {
                    sendError(res, error);
                } else {
                    console.log(result);
                    res.json(result);
                    res.end();
                }
            })
    //     }
    // });
})

//Get Specefic Data...
orderRouter.get("/", function (req, res) {
    
    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         sendError(res, error);
    //     } else {
            const dbOrder = Client.db("order");
            const collecOrder = dbOrder.collection("data");
            var { id, user_phone_number, pharmacy_id, status, deliveryman_phone_number } = req.query;
            var query = null;
            console.log(req.query);
            if (id != null) {
                query = { _id: id };
                findDataObjectThenSend(res, collecOrder, query);
            }

            else if (user_phone_number != null) {
                if (status != null) {
                    query = { "meta_data.user_phone_number": user_phone_number, "meta_data.status": status };
                    findDataArrayThenSend(res, collecOrder, query);
                } else {
                    console.log(user_phone_number);
                    query = { "meta_data.user_phone_number": user_phone_number };
                    findDataArrayThenSend(res, collecOrder, query);
                }
            }

            else if (pharmacy_id != null) {
                if (status != null) {
                    query = { "meta_data.pharmacy_id": pharmacy_id, "meta_data.status": status };
                    findDataArrayThenSend(res, collecOrder, query);
                } else {
                    query = { "meta_data.pharmacy_id": pharmacy_id };
                    findDataArrayThenSend(res, collecOrder, query);
                }
            }

            else if (deliveryman_phone_number != null) {

                if (status != null) {
                    console.log("Order by deliveryman_phone_number and Status");
                    query = { "meta_data.deliveryman_phone_number": deliveryman_phone_number, "meta_data.status": status };
                    findDataArrayThenSend(res, collecOrder, query);
                } else {
                    console.log("Order by deliveryman_phone_number");
                    query = { "meta_data.deliveryman_phone_number": deliveryman_phone_number };
                    findDataArrayThenSend(res, collecOrder, query);
                }

            } else {
                notFoundException(res, "Nothing Found!");
            }
    //     }
    // });
})



//Get All Data...
orderRouter.get("/all", function (req, res) {

    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         sendError(res, error);
    //     } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");
            var query = {};
            var { action, status } = req.query;

            console.log(req.query);
            // Get All Local Order...
            if (action != null && action == "local") {
                collecOrder.find(query).toArray(function (error, result) {
                    if (error) {
                        sendError(res, error);
                    } else {
                        if (status != null) {
                            //Get All local order By Status...
                            query = { "meta_data.status": status };

                            collecOrder.find(query).toArray(function (error, result) {
                                if (error) {
                                    sendError(res, error);
                                } else {
                                    filterLocalOrderThenSend(req, res, result);
                                }
                            })
                        } else {
                            filterLocalOrderThenSend(req, res, result);
                        }
                    }
                })
            }
            else {
                findDataArrayThenSend(res, collecOrder, query);
            }
    //     }
    // });
})

//Filter Order by Date Range...
orderRouter.get("/range", function (req, res) {
    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         sendError(res, error);
    //     } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");

            var query = {};
            collecOrder.find(query).toArray(function (error, result) {
                if (error) {
                    sendError(res, error);
                } else {
                    console.log(result);
                    if (result != null && result.length > 0) {

                        var fromDate = req.query.from_date;
                        var toDate = req.query.to_date;
                        let rangeOrderResult = [];
                        if (fromDate != null && toDate != null) {
                            var fromDateMillisec = getDateMillisecFromDateString(fromDate);
                            var toDateMillisec = getDateMillisecFromDateString(toDate);
                            for (let index = 0; index < result.length; index++) {
                                const element = result[index];
                                var dateForCheckMillisec = result.meta_data.created_at;

                                if (isDateInsideOfDateRange(fromDateMillisec, toDateMillisec,
                                    dateForCheckMillisec)) {
                                    rangeOrderResult.push(result[index]);
                                }
                                if (index == (result.length - 1)) {
                                    res.json(rangeOrderResult);
                                    res.end();
                                }
                            }
                        } else {
                            res.json({});
                            notFoundException(res, "Nothing Found!")
                        }
                    } else {
                        res.json({});
                        notFoundException(res, "Nothing Found!")
                    }
                }
            })
    //     }
    // });
})

//Update Order By  ID...
orderRouter.patch("/:id", function (req, res) {
    var Client = mongoUtil.getMongoClient();
    // MongoClient.connect(connectionUrl, config, function (error, Client) {
    //     if (error) {
    //         sendError(res, error);
    //     } else {
            let dbOrder = Client.db("order");
            let collecOrder = dbOrder.collection("data");
            let updatedData = req.body;
            let id = req.params.id;
            console.log(id);
            //var ObjectID = require('mongodb').ObjectID;
            //var query = {"_id": ObjectID(req.params.id)};
            let query = { "_id": id };
            var newvalues = { $set: updatedData };
            collecOrder.updateOne(query, newvalues, function (error, result) {
                if (error) {
                    console.log(error);
                    res.sendStatus(404);
                    res.end();
                } else {
                    console.log("1 document updated");
                    console.log(result);
                    res.json(result);
                    res.end();
                }
            })
    //     }
    // });
})


function filterLocalOrderThenSend(req, res, result) {

    if (result == null || result.length < 1) {
        res.json(result);
        notFoundException(res, "Nothing Found!");
        return;
    }

    var deliverymanLat = req.query.lat;
    var deliverymanLng = req.query.lng;
    var maxDistance = req.query.max_distance;

    if (deliverymanLat != null && deliverymanLng != null) {

        var filteredResult = [];

        for (let i = 0; i < result.length; i++) {
            const element = result[i];

            var pharmacyLat = element.meta_data.pharmacy_lat;
            var pharmacyLng = element.meta_data.pharmacy_lng;

            let distense = getDistanceOfAreaFromOnePlaceToAnother(
                deliverymanLat, deliverymanLng, pharmacyLat, pharmacyLng);
            if (distense == maxDistance || distense < maxDistance) {
                filteredResult.push(element);
            }
            if (i == (result.length - 1)) {
                res.json(filteredResult);
                res.end();
            }
        }
    } else {
        res.json(result);
        res.end();
    }
}


function getDistanceOfAreaFromOnePlaceToAnother(fromLat, fromLng, toLat, toLng) {
    let disLatKM;
    let disLngKM;

    if (fromLat < toLat) {
        disLatKM = (toLat - fromLat) * 111.0;
        disLngKM = (toLng - fromLng) * 111.0;
        return Math.sqrt((disLatKM * disLatKM) + (disLngKM * disLngKM))
    } else {
        disLatKM = (fromLat - toLat) * 111.0;
        disLngKM = (fromLng - toLng) * 111.0;
        return Math.sqrt((disLatKM * disLatKM) + (disLngKM * disLngKM))
    }
}


function findDataArrayThenSend(res, collection, query) {
    collection.find(query).toArray(function (error, result) {
        if (error) {
            console.log(error);
            res.json({});
            res.end();
        } else {
            res.json(result);
            console.log(result);
            res.end();
        }
    })
}
function findDataObjectThenSend(res, collection, query) {
    collection.findOne(query, function (error, result) {
        if (error) {
            sendError(res, error);
        } else {
            if (result != null && result.length > 0) {
                sendResult(res, result);
            } else {
                res.json(result);
                notFoundException(res, "Nothing Found!");
            }
        }
    });
}

function sendError(res, error) {
    console.log(error);
    res.status(404);
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
    //res.json({ status: 0, message })
    //res.status(404)
    res.json({});
    res.end();

}

function generateID(type) {
    var currentDateInMillisecond = Date.now();
    function prepareDate(d) {
        [d, m, y] = d.split("-"); //Split the string
        return [y, m - 1, d]; //Return as an array with y,m,d sequence
    }
    let str = "31-12-2020";
    let date2020 = new Date(...prepareDate(str));
    let currentDateInMillisecAfter2020 = currentDateInMillisecond - date2020.getTime();
    console.log(type + currentDateInMillisecAfter2020);
    return type + currentDateInMillisecAfter2020;
}

function isDateInsideOfDateRange(fromDateMillisec, toDateMillisec, dateForCheckMillisec) {
    if (dateForCheckMillisec >= fromDateMillisec && dateForCheckMillisec <= toDateMillisec) {
        var different = toDate - fromDate;
        console.log("Different: " + different);
        return true;
    } else {
        return false;
    }
}
function getDateMillisecFromDateString(dateString) {
    //var date = Date.parse("11/22/12");
    return Date.parse(dateString);
}

module.exports = orderRouter;