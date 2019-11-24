var MongoClient = require('mongodb').MongoClient; // require the mongodb driver

/**
 * Uses mongodb v3.1.9 - [API Documentation](http://mongodb.github.io/node-mongodb-native/3.1/api/)
 * StoreDB wraps a mongoDB connection to provide a higher-level abstraction layer
 * for manipulating the objects in our bookstore app.
 */
function StoreDB(mongoUrl, dbName) {
    if (!(this instanceof StoreDB)) return new StoreDB(mongoUrl, dbName);
    this.connected = new Promise(function(resolve, reject) {
        MongoClient.connect(
            mongoUrl, {
                useNewUrlParser: true
            },
            function(err, client) {
                if (err) reject(err);
                else {
                    console.log('[MongoClient] Connected to ' + mongoUrl + '/' + dbName);
                    resolve(client.db(dbName));
                }
            }
        )
    });
}
StoreDB.prototype.getProducts = function(queryParams) {
    return this.connected.then(function(db) {
        var query = { $and: [] };
        if (queryParams.minPrice) {
            query["$and"].push({
                "price": {
                    $gte: parseInt(queryParams.minPrice)
                }
            })
        }
        if (queryParams.maxPrice) {
            query["$and"].push({
                "price": {
                    $lte: parseInt(queryParams.maxPrice)
                }
            })
        }
        if (queryParams.category) {
            query["$and"].push({
                "category": queryParams.category
            })
        }
        if (query.$and.length == 0) {
            query = {}
        }
        return db.collection("products").find(query).toArray().then(function(result) {
            var products = {};
            for (var i = 0; i != result.length; i++) {
                console.log(i)
                products[result[i]._id] = result[i];
            }
            return products;
        }, function(err) {
            throw err;
        });
    })
}

StoreDB.prototype.addOrder = function(order) {
    return this.connected.then(function(db) {
        // TODO: Implement functionality
    })
}

module.exports = StoreDB;