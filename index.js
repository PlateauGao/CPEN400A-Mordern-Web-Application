// Require dependencies
var path = require('path');
var express = require('express');
// s
// Declare application parameters
var PORT = process.env.PORT || 3000;
var STATIC_ROOT = path.resolve(__dirname, './public');
var StoreDB = require('./StoreDB.js');
var db = new StoreDB("mongodb://127.0.0.1:27017", "cpen400a-bookstore");

// Defining CORS middleware to enable CORS.
// (should really be using "express-cors",
// but this function is provided to show what is really going on when we say "we enable CORS")
function cors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT");
    next();
}

// Instantiate an express.js application
var app = express();

// Configure the app to use a bunch of middlewares
app.use(express.json()); // handles JSON payload
app.use(express.urlencoded({ extended: true })); // handles URL encoded payload
app.use(cors); // Enable CORS

app.use('/', express.static(STATIC_ROOT)); // Serve STATIC_ROOT at URL "/" as a static resource

// Configure '/products' endpoint
app.get('/products', function(request, response) {
    return db.getProducts(request.query).then(function(result) {
        return response.json(result);
    }, function(err) {
        response.statusCode = 500;
        console.log("get error")
    })
});


app.post('/checkout', function(request, response, next) {

    var order = request.body;

    var valid = order.hasOwnProperty("client_id") && typeof order.client_id == "string" &&
        order.hasOwnProperty("cart") && typeof order.cart == "object" &&
        order.hasOwnProperty("total") && typeof order.total == "number";
    if (!valid) {
        console.log('Validation Failed');
        response.statusCode = 500;
        return;
    } else {
        return db.addOrder(order).then(function(resolvedId) {
            return response.json({ id: resolvedId });
        }, function(err) {
            err.statusCode = 500;
            console.log('Add Order Failed')
        });
    }
});



// Start listening on TCP port
app.listen(PORT, function() {
    console.log('Express.js server started, listening on PORT ' + PORT);
});