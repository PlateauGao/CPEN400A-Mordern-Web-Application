var keys = [
    "Box1", "Box2", "Clothes1", "Clothes2", "Jeans", "KeyboardCombo", "Keyboard", "Mice", "PC1", "PC2", "PC3", "Tent"
];

var labels = ["Box White", "Boxes Set", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
var prices = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
var quantities = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
var imageUrl = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

function Product(label, imageUrl, price, quantity) {
    this.label = label;
    this.price = price;
    this.imageUrl = imageUrl;
    this.quantity = quantity;
}
var products = {}; /*associate array */

for (let i = 0; i != 20; i++) {
    products[keys[i]] = new Product(labels[i], prices[i], imageUrl[i], quantities[i]);
}
/*
for (key in products) {
    val = products[key];
    console.log(val.price);
    console.log(val.label);
}
*/

let Store = function(initialStock) {

    this.stock = initialStock;
    this.cart = {};
    this.addItemToCart = function(itemName1) {

        var itemName = itemName1.slice(1);
        alert("added:" + itemName);
        if (!this.cart.hasOwnProperty(itemName)) {
            //if this.stock[id].quatities==0
            this.cart[itemName] = 1;

        } else {
            //
            this.cart[itemName]++;

        }
        alert("done");

    }
    this.removeItemFromCart = function(itemName) {

    }
    this.getCart = function() {
        return this.cart;
    }
}

var store = new Store(products);

function showCart(cart) {
    let v = [];
    alert("test");
    let output = []
    for (var key in cart) {

        output = output + products[key].label + ": " + cart[key] + "\n";
    }
    alert(output);
    alert("Done");
}


document.getElementById('show').onclick = function() {
    showCart(store.getCart());
}


let addfunction = function(id) {
    return function() {
        alert("start");
        store.addItemToCart(id);
    }
}

keys.forEach(function(e) {
    var t = "a" + e;
    document.getElementById(t).onclick = addfunction(t);
})



function timeout() {
    setTimeout(function() {
        alert("testTime");
        timeout();
    }, 2000);
}
//timeout()