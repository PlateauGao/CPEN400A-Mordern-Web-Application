var keys = [
    "Box1", "Box2", "Clothes1", "Clothes2", "Jeans", "KeyboardCombo", "Keyboard", "Mice", "PC1", "PC2", "PC3", "Tent"
];

var labels = keys;
// ["White Box", "Boxes Set", "Red Dress", "T-shirt", "Jeans", "Red Keyboard", "Colorful Keyboard", "Mouse", "Dell PC", "Intel PC Set", "Intel PC", "Tent"];

var imageUrls = [

    "images/Box2_$5.png",
    "images/Box1_$10.png",
    "images/Clothes1_$20.png",
    "images/Clothes2_$30.png",
    "images/Jeans_$50.png",
    "images/KeyboardCombo_$40.png",
    "images/Keyboard_$20.png",
    "images/Mice_$20.png",
    "images/PC1_$350.png",
    "images/PC2_$400.png",
    "images/PC3_$300.png",
    "images/Tent_$100.png"
];

var prices = [10, 5, 20, 30, 50, 40, 20, 20, 350, 400, 300, 100];
var quantities = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

var Store = function(initialStock) {
    this.stock = initialStock;
    this.cart = {};
    this.onUpdate = null;
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

store.onUpdate = function(itemName) {

    // var li = document.createElement('li');
    // renderProduct(li, this, itemName);
    // var id = "product-" + itemName;
    // var previous = document.getElementById(id);
    // previous.parentNode.replaceChild(li, previous);
    //
    // renderCart(document.getElementById("modal-content"), store);
    var productId = document.getElementById('product-' + itemName);
    renderProduct(productId, this, itemName);
    renderCart(document.getElementById('modal-content'), this);
};


Store.prototype.addItemToCart = function(itemName) {


    if (this.stock[itemName].quantity === 0) {
        // alert(itemName + " sold out.");
        return;
    } else {
        this.stock[itemName].quantity--;
    }

    //  alert("Add " + itemName + " to the cart.");
    //   alert(itemName + " " + this.stock[itemName].quantity + " on the stock.");
    if (!this.cart.hasOwnProperty(itemName))
        this.cart[itemName] = 1;
    else {
        this.cart[itemName]++;
    }

    this.onUpdate(itemName);
};

Store.prototype.removeItemFromCart = function(itemName) {
    if (!this.cart.hasOwnProperty(itemName)) {
        //   alert("No " + itemName + " in the cart.");
        return;
    }

    //  alert("Removing " + itemName + " from cart.");
    this.cart[itemName]--;
    if (this.cart[itemName] === 0)
        delete this.cart[itemName];
    // alert("Done.");

    this.stock[itemName].quantity++;
    this.onUpdate(itemName);
};


function addToCart(itemName) {

    store.addItemToCart(itemName);
    timerStop();
    inactiveTime = 0;
    timeID = setInterval(timerStart, 1000);


}

function removeFromCart(itemName) {

    store.removeItemFromCart(itemName);
    timerStop();
    inactiveTime = 0;
    timeID = setInterval(timerStart, 1000);

}



var inactiveTime = 0;

var timeID;
var timerStart = function() {
    if (inactiveTime < 3000) //3000s
        inactiveTime++;
    else {
        alert('Hey there! Are you still planning to buy something?');
        timerStop();
        inactiveTime = 0;
    }
};
//timeID = setInterval(timerStart, 100);

var timerStop = function() {
    clearTimeout(timeID);
};
timerStop();

function renderProduct(container, storeInstance, itemName) {
    //  container = document.getElementById(1);
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    var id = "product-" + itemName;
    container.setAttribute('id', id);
    container.setAttribute('class', 'product');

    var img = document.createElement('img');
    img.setAttribute('src', storeInstance.stock[itemName].imageUrl);
    container.appendChild(img);


    if (storeInstance.stock[itemName].quantity > 0) {
        var addButton = document.createElement('button');
        addButton.setAttribute('class', "btn-add");
        var addButtonId = "add" + itemName;
        addButton.setAttribute('id', addButtonId);
        addButton.appendChild(document.createTextNode("Add"));
        var addClick = "addToCart(\"" + itemName + "\")";
        addButton.setAttribute('onclick', addClick);
        container.appendChild(addButton);
    }

    if (storeInstance.cart.hasOwnProperty(itemName)) {
        var removeButton = document.createElement('button');
        removeButton.setAttribute('class', "btn-remove");
        var removeButtonId = "remove" + itemName;
        removeButton.setAttribute('id', removeButtonId);
        removeButton.appendChild(document.createTextNode("Remove"));
        var removeClick = "removeFromCart(\"" + itemName + "\")";
        removeButton.setAttribute('onclick', removeClick);
        container.appendChild(removeButton);
    }

    var priceTag = document.createElement('div');
    priceTag.setAttribute('class', "price");
    var priceLabel = document.createElement('p');
    priceLabel.appendChild(document.createTextNode(itemName + ": "))
    priceLabel.appendChild(document.createTextNode("$" + storeInstance.stock[itemName].price))
    priceTag.appendChild(priceLabel);
    container.appendChild(priceTag);

    return container;
}

function renderProductList(container, storeInstance) {
    var ul = document.createElement("ul");
    ul.setAttribute('id', "productList");

    for (var i = 0; i < Object.keys(storeInstance.stock).length; i++) {
        var li = document.createElement('li');
        li = renderProduct(li, storeInstance, Object.keys(storeInstance.stock)[i]);
        ul.appendChild(li);
    }
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(ul);
}


function showCart() {
    var myModal = document.getElementById("modal");
    myModal.style.display = "block";
    renderCart(document.getElementById("modal-content"), store);
}


function renderCart(container, storeInstance) {
    var table = document.createElement('table');


    var row = document.createElement('tr');

    var col1 = document.createElement('th');
    col1.appendChild(document.createTextNode("Item Name"));
    var col2 = document.createElement('th');
    col2.appendChild(document.createTextNode("Quantity"));
    var col3 = document.createElement('th');
    col3.appendChild(document.createTextNode("Total Price"));
    var col4 = document.createElement('th');
    col4.appendChild(document.createTextNode("Operations"));
    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);
    row.appendChild(col4);
    table.appendChild(row);


    for (var item in storeInstance.cart) {
        var row = document.createElement('tr');
        var col1 = document.createElement('td');
        col1.appendChild(document.createTextNode(storeInstance.stock[item].label));
        var col2 = document.createElement('td');
        col2.appendChild(document.createTextNode(storeInstance.cart[item]));

        var col3 = document.createElement('td');
        col3.appendChild(document.createTextNode(storeInstance.cart[item] * storeInstance.stock[item].price));
        var col4 = document.createElement('td');

        var addBtn = document.createElement('button');
        addBtn.setAttribute('class', 'btn-cartAdd');
        var addButtonId = "add" + item;
        addBtn.setAttribute('id', addButtonId);
        addBtn.appendChild(document.createTextNode("Add"));
        var addClick = "addToCart(\"" + item + "\")";
        addBtn.setAttribute('onclick', addClick);




        var removeBtn = document.createElement('button');
        removeBtn.setAttribute('class', 'btn-cartRemove');
        var removeButtonId = "remove" + item;
        removeBtn.setAttribute('id', removeButtonId);
        removeBtn.appendChild(document.createTextNode("Remove"));
        var removeClick = "removeFromCart(\"" + item + "\")";
        removeBtn.setAttribute('onclick', removeClick);

        col4.appendChild(addBtn);
        col4.appendChild(removeBtn);


        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
        row.appendChild(col4);

        // row.appendChild(coldocument.createElement('td'));
        // row.appendChild(col3);
        //  row.appendChild(document.createElement('td').appendChild(document.createTextNode("123")))
        //row.appendChild(document.createElement('td').appendChild(document.createTextNode(store.cart[item])))
        table.appendChild(row)

    }


    while (container.firstChild) {

        container.removeChild(container.firstChild);

    }

    //   container.appendChild(table);

    container.appendChild(table);

    // var exit = document.createElement('button');
    // exit.setAttribute('id', 'btn-hide-cart');
    // exit.setAttribute('onclick', 'hideCart()');
    // var text = document.createElement("p")
    // text.appendChild(document.createTextNode("x"))
    // exit.appendChild(text)
    // container.appendChild(exit);
}

function hideCart() {
    var myModal = document.getElementById("modal");
    myModal.style.display = "none";
}

window.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        hideCart();
    }

});



window.onload = function() {
    renderProductList(document.getElementById("productView"), store);
    document.getElementById('btn-show-cart').onclick = showCart;

};