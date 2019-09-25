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
    var cart = [];
    this.addItemToCart = function(itemName) {
        alert(itemName);
        cart.push("-1");
        alert(cart[0]);
        alert(cart.length);
        alert("0");

    }
    this.removeItemFromCart = function(itemName) {

    }
    this.temp = function() {
        alert("test");
    }
}

var store = new Store(products);


function showCart() {
    alert("Button 1 was clicked!");
    alert("Button 2 was clicked!");
    for (item in cart) {
        alert(item.keys + ":");
    }
    alert("Button 3 was clicked!");
}


document.getElementById('show').onclick = function() {
    showCart();
}
document.getElementById('Box1').onclick = function() {

    store.addItemToCart(this.id);
}