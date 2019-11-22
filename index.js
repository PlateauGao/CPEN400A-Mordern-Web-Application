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
    let query = {};
    const category = request.query.category;
    if (category != null) {
        query["category"] = category;
    }

    const minPrice = request.query.minPrice;
    if (minPrice != null) {
        query["minPrice"] = minPrice;
    }

    const maxPrice = request.query.maxPrice;
    if (maxPrice != null) {
        query["maxPrice"] = maxPrice;
    }

    db.getProducts(query)
        .then((products) => {
            return response.json(products);
        })
        .catch((err) => {
            console.log(err);
            return response.status(500).send("Error fetching products");
        })
});

// Start listening on TCP port
app.listen(PORT, function() {
    console.log('Express.js server started, listening on PORT ' + PORT);
});