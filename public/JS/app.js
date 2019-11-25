let displayed = [];


var Store = function(serverUrl) {
    this.stock = {};
    this.cart = {};
    this.onUpdate = null;
    this.serverUrl = serverUrl;

};

var store = new Store("http://localhost:3003");

store.onUpdate = function(itemName) {
    if (typeof itemName == "undefined") {

        renderProductList(document.getElementById("productView"), this);
    }
    //   renderMenu(document.getElementById("menuView"), this);
    else {
        var productId = document.getElementById('product-' + itemName);
        renderProduct(productId, this, itemName);
    }
    renderCart(document.getElementById('modal-content'), this);
    renderMenu(document.getElementById("menuView"), this);
};
var ajaxPost = function(url, data, onSuccess, onError) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhttp.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // Request finished. Do processing here.
            onSuccess(JSON.parse(xhttp.response));
        } else {
            onError(xhttp.response);
        }
    }
    xhttp.onerror = onError;
    xhttp.send(JSON.stringify(data))
}
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
                    response = JSON.parse(this.response);
                    onSuccess(response)
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
        //response = response.response;

        //   console.log(response);
        for (var k in response) {
            if (!obj.stock.hasOwnProperty(k)) {
                obj.stock[k] = {
                    label: response[k].label,
                    imageUrl: response[k].imageUrl,
                    price: response[k].price,
                    quantity: response[k].quantity
                };
                delta[k] = {
                    price: response[k].price,
                    quantity: response[k].quantity
                }
            } else {
                delta[k] = {};

                delta[k].price = response[k].price - obj.stock[k].price;
                obj.stock[k].price = response[k].price;

                if (!obj.cart.hasOwnProperty(k)) {
                    delta[k].quantity = response[k].quantity - obj.stock[k].quantity;
                    obj.stock[k].quantity = response[k].quantity;
                } else { //item in cart requireds changing
                    delta[k].quantity = response[k].quantity - obj.stock[k].quantity - obj.cart[k];
                    if (obj.cart[k] > response[k].quantity)
                        obj.cart[k] = response[k].quantity;
                    obj.stock[k].quantity = response[k].quantity - obj.cart[k];
                    if (obj.cart[k] === 0)
                        delete obj.cart[k];
                }
            }
            renderCart(document.getElementById('modal-content'), obj);
        }
        obj.onUpdate();
        if (onSync !== undefined)
            onSync(delta); // works but not necessarily as intended
    }, function(error) {
        console.log(error);
    })
};

var checkOutBtn = function() {

    var btn = document.getElementById("btn-check-out");
    btn.disabled = true;
    store.checkOut(function() {
        btn.disabled = false;
    });
};


Store.prototype.checkOut = function(onFinish) {
    var obj = this;
    // console.log(obj.cart);
    obj.syncWithServer(function(delta) {

        var alertPrice = "";
        var alertQuantity = "";
        for (var item in delta) {
            if (delta[item].price !== 0) {
                var prevPrice = obj.stock[item].price - delta[item].price;
                var currPrice = obj.stock[item].price;
                alertPrice += "Price of " + item + " changed from " +
                    prevPrice + " to " + currPrice + "\n";
            }
            if (delta[item].quantity !== 0) {
                var prevQuantity;
                var currQuantity;
                if (obj.cart.hasOwnProperty(item)) {
                    prevQuantity = obj.stock[item].quantity + obj.cart[item] - delta[item].quantity;
                    currQuantity = obj.stock[item].quantity + obj.cart[item];
                } else {
                    prevQuantity = obj.stock[item].quantity - delta[item].quantity;
                    currQuantity = obj.stock[item].quantity;
                }
                alertQuantity += "Quantity of " + item + " changed from " +
                    prevQuantity + " to " + currQuantity + "\n";
            }
        }
        if (alertPrice === "" && alertQuantity === "") {
            var total = 0;
            for (var item in obj.cart)
                total += obj.cart[item] * obj.stock[item].price;
            var order = {
                client_id: Math.random().toString(),
                cart: obj.cart,
                total: total
            };
            var x = 0

            ajaxPost(obj.serverUrl + "/checkout", order, function() {
                alert("Successful check out");
                obj.cart = {};
                obj.onUpdate();
            }, function() {

                alert("error" + x);
                x = x + 1;
            });
        } else {
            var alertContent = alertPrice + "\n" + alertQuantity;
            alert(alertContent);
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

    for (var i in displayed) {

        var li = document.createElement('li');
        li = renderProduct(li, storeInstance, displayed[i]);
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
////////////////////
Store.prototype.queryProducts = function(query, callback) {
        var self = this;
        var queryString = Object.keys(query).reduce(function(acc, key) {
            return acc + (query[key] ? ((acc ? '&' : '') + key + '=' + query[key]) : '');
        }, '');
        ajaxGet(this.serverUrl + "/products?" + queryString,
            function(products) {
                Object.keys(products)
                    .forEach(function(itemName) {
                        var rem = products[itemName].quantity - (self.cart[itemName] || 0);
                        if (rem >= 0) {
                            self.stock[itemName].quantity = rem;
                        } else {
                            self.stock[itemName].quantity = 0;
                            self.cart[itemName] = products[itemName].quantity;
                            if (self.cart[itemName] === 0) delete self.cart[itemName];
                        }

                        self.stock[itemName] = Object.assign(self.stock[itemName], {
                            price: products[itemName].price,
                            label: products[itemName].label,
                            imageUrl: products[itemName].imageUrl
                        });
                    });
                self.onUpdate();
                callback(null, products);
            },
            function(error) {
                callback(error);
            }
        )
    }
    /////////////////////
function renderMenu(container, storeInstance) {
    while (container.lastChild) container.removeChild(container.lastChild);
    if (!container._filters) {
        container._filters = {
            minPrice: null,
            maxPrice: null,
            category: ''
        };
        container._refresh = function() {
            storeInstance.queryProducts(container._filters, function(err, products) {
                if (err) {
                    alert('Error occurred trying to query products');
                    console.log(err);
                } else {

                    displayed = Object.keys(products);
                    renderProductList(document.getElementById('productView'), storeInstance);
                }
            });
        }
    }

    var box = document.createElement('div');
    container.appendChild(box);
    box.id = 'price-filter';
    var input = document.createElement('input');
    box.appendChild(input);
    input.type = 'number';
    input.value = container._filters.minPrice;
    input.min = 0;
    input.placeholder = 'Min Price';
    input.addEventListener('blur', function(event) {
        container._filters.minPrice = event.target.value;
        container._refresh();
    });

    input = document.createElement('input');
    box.appendChild(input);
    input.type = 'number';
    input.value = container._filters.maxPrice;
    input.min = 0;
    input.placeholder = 'Max Price';
    input.addEventListener('blur', function(event) {
        container._filters.maxPrice = event.target.value;
        container._refresh();
    });

    var list = document.createElement('ul');
    container.appendChild(list);
    list.id = 'menu';
    var listItem = document.createElement('li');
    list.appendChild(listItem);
    listItem.className = 'menuItem' + (container._filters.category === '' ? ' active' : '');
    listItem.appendChild(document.createTextNode('All Items'));
    listItem.addEventListener('click', function(event) {
        container._filters.category = '';
        container._refresh()
    });
    var CATEGORIES = ['Clothing', 'Technology', 'Office', 'Outdoor'];
    for (var i in CATEGORIES) {
        var listItem = document.createElement('li');
        list.appendChild(listItem);
        listItem.className = 'menuItem' + (container._filters.category === CATEGORIES[i] ? ' active' : '');
        listItem.appendChild(document.createTextNode(CATEGORIES[i]));
        listItem.addEventListener('click', (function(i) {
            return function(event) {
                container._filters.category = CATEGORIES[i];
                container._refresh();
            }
        })(i));
    }
}


///////////////////////

window.onload = function() {
    store.syncWithServer(function(delta) {

        for (var each in delta) {
            displayed.push(each);
        }
        renderProductList(document.getElementById("productView"), store);
    });

    renderProductList(document.getElementById("productView"), store);
    document.getElementById('btn-show-cart').onclick = showCart;

};