var keys = [
    "Box1", "Box2", "Clothes1", "Clothes2", "Jeans", "KeyboardCombo", "Keyboard", "Mice", "PC1", "PC2", "PC3", "Tent"
];
var labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
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

function Store(initialStock) {
    this.stock = initialStock;
    this.cart = {};
    this.addItemToCart = function(itemName) {

        if (!this.cart.hasOwnProperty(itemName)) {
            this.cart[itemName] = 1;

        } else {
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

    for (var key in cart) {
        alert(key + " : " + cart[key]);
    }

    alert("Done");
}


document.getElementById('show').onclick = function() {
    showCart(store.cart());
}
document.getElementById('Box1').onclick = function() {

    store.addItemToCart(this.id);
}

function timeout() {
    setTimeout(function() {
        alert("testTime");
        timeout();
    }, 2000);
}
//timeout();