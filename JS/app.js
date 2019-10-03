var keys = [
    "Box1", "Box2", "Clothes1", "Clothes2", "Jeans", "KeyboardCombo", "Keyboard", "Mice", "PC1", "PC2", "PC3", "Tent"
];

var labels = ["White Box", "Boxes Set", "Red Dress", "T-shirt", "Jeans", "Red Keyboard", "Colorful Keyboard", "Mouse", "Dell PC", "Intel PC Set", "Intel PC", "Tent"];

var imageUrls = [
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Box1_$10.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Box2_$5.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Clothes1_$20.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Clothes2_$30.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Jeans_$50.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/KeyboardCombo_$40.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Keyboard_$20.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Mice_$20.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/PC1_$350.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/PC2_$400.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/PC3_$300.png?raw=true",
    "https://github.com/PlateauGao/assignments/blob/master/assignments/images/Tent_$100.png?raw=true"
];

var prices = [10, 5, 20, 30, 50, 40, 20, 20, 350, 400, 300, 100];
var quantities = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

var Store = function(initialStock) {
    this.stock = initialStock;
    this.cart = {};
};

Store.prototype.addItemToCart = function(itemName) {
    if (this.stock[itemName].quantity === 0) {
        alert(itemName + " sold out.");
        return;
    } else {
        this.stock[itemName].quantity--;
    }

    alert("Add " + store.stock[itemName].label + " to the cart.");
    //   alert(itemName + " " + this.stock[itemName].quantity + " on the stock.");
    if (!this.cart.hasOwnProperty(itemName))
        this.cart[itemName] = 1;
    else {
        this.cart[itemName]++;
    }
    // alert(itemName + " " + this.cart[itemName] + " in the cart.");
    //alert("Done.");
};

Store.prototype.removeItemFromCart = function(itemName) {
    if (!this.cart.hasOwnProperty(itemName)) {
        alert("No " + itemName + " in the cart.");
        return;
    }

    alert("Removing " + store.stock[itemName].label + " from cart.");
    this.cart[itemName]--;
    if (this.cart[itemName] === 0)
        delete this.cart[itemName];
    // alert("Done.");

    this.stock[itemName].quantity++;
};

var products = {};

var Product = function(label, imageUrl, price, quantity) {
    this.label = label;
    this.imageUrl = imageUrl;
    this.price = price;
    this.quantity = quantity;
};

for (var i = 0; i < keys.length; i++)
    products[keys[i]] = new Product(labels[i], imageUrls[i], prices[i], quantities[i]);

var store = new Store(products);

function addToCart(itemName) {
    return function() {
        store.addItemToCart(itemName);
        timerStop();
        inactiveTime = 0;
        timeID = setInterval(timerStart, 1000);

    }
}

function removeFromCart(itemName) {
    return function() {
        store.removeItemFromCart(itemName);
        timerStop();
        inactiveTime = 0;
        timeID = setInterval(timerStart, 1000);
    }
}

function showCart(cart) {
    var itemList = "";
    for (var item in cart)
        itemList += store.stock[item].label + ": " + cart[item] + "\n";
    timerStop();
    inactiveTime = 0;
    timeID = setInterval(timerStart, 1000);
    itemList == "" ? alert("The cart is empty") : alert(itemList);
}

keys.forEach(function(itemName) {
    var addButtonID = "add" + itemName;
    var removeButtonID = "remove" + itemName;
    document.getElementById(addButtonID).onclick = addToCart(itemName);
    document.getElementById(removeButtonID).onclick = removeFromCart(itemName);
});

document.getElementById('btn-show-cart').onclick = function() {
    showCart(store.cart);
};

var inactiveTime = 0;

var timeID;
var timerStart = function() {
    if (inactiveTime < 3)
        inactiveTime++;
    else {
        alert('Hey there! Are you still planning to buy something?');
        timerStop();
        inactiveTime = 0;
    }
}
timeID = setInterval(timerStart, 100);

var timerStop = function() {
    clearTimeout(timeID);
}
timerStop();