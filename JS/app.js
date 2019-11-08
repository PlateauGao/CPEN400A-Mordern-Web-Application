var Store = function(serverUrl) {
    this.stock = {};
    this.cart = {};
    this.onUpdate = null;
    this.serverUrl = serverUrl;

};

var store = new Store("https://cpen400a-bookstore.herokuapp.com");

store.onUpdate = function(itemName) {
    if (typeof itemName == "undefined") {
        renderProductList(document.getElementById("productView"), store);
    } else {
        var productId = document.getElementById('product-' + itemName);
        renderProduct(productId, this, itemName);
        renderCart(document.getElementById('modal-content'), this);
    }
};

var ajaxGet = function(url, onSuccess, onError) {
    var cnt = 0;
    var getHandler = function() {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url);
        xhttp.timeout = 4000; // 4 seconds

        xhttp.ontimeout = function() {
            console.log("time out at: " + cnt);
            cnt++;
            if (cnt <= 3)
                getHandler();
            else {
                console.log("fail: error ");
                onError(this.status)
            }
        };

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    console.log("success ");
                    onSuccess(this.response)
                } else {
                    cnt++;
                    if (cnt >= 3) {
                        console.log("fai: error ");
                        onError(this.status)
                    } else {
                        console.log("fail:retry " + cnt + " times");
                        getHandler()
                    }
                }
            }
        };

        xhttp.send();
    };
    getHandler();
};

Store.prototype.syncWithServer = function(onSync) {
    var obj = this;
    var delta = {};
    ajaxGet(obj.serverUrl + "/products", function(response) {
        response = JSON.parse(response);
        console.log(response);
        for (var k in response) {
            // console.log(k)
            if (!obj.stock.hasOwnProperty(k)) {
                obj.stock[k] = {
                    label: response[k].label,
                    imageUrl: response[k].imageUrl,
                    price: response[k].price,
                    quantity: response[k].quantity,
                };

            }
        }
        obj.onUpdate();
        if (onSync !== undefined) {
            onSync(delta); // works but not neccesarily as intended
        }
    }, function(error) {
        console.log(error);
    })
};
checkOutBtn = function(onFinish) {

    var btn = document.getElementById("btn-check-out");
    btn.disabled = true;
    store.checkOut(function() {
        btn.disabled = false;
    });
};
Store.prototype.checkOut = function(onFinish) {
    this.syncWithServer(function(delta) {
        if (delta !== null) {
            var alertContent = "";
            for (var obj in delta) {
                for (var property in obj) {
                    var currentValue = this.stock[obj][property] + delta[obj][property];
                    alertContent += property + " of " + obj +
                        " changed from " + this.stock[obj][property] +
                        " to " + currentValue + "\n";
                }
            }
            alert(alertContent);
        } else {
            var totalAmount = 0;
            for (var item in this.cart) {
                totalAmount += this.cart[item] * this.stock[item].price;
            }
            alert("Total amount due is " + totalAmount);
        }
    });
    onFinish();
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
    priceLabel.appendChild(document.createTextNode(itemName + ": "));
    priceLabel.appendChild(document.createTextNode("$" + storeInstance.stock[itemName].price));
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
    store.syncWithServer();

    renderProductList(document.getElementById("productView"), store);
    document.getElementById('btn-show-cart').onclick = showCart;

};