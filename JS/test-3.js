HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.addEventListener = function(type, listener, options) {
    if (!this.__listeners) this.__listeners = {};
    if (!this.__listeners[type]) this.__listeners[type] = [];
    this.__listeners[type].push(listener);
    return this.__addEventListener(type, listener, options)
};
$(document).ready(function() {
    function randKey() {
        var text = "";
        for (var i = 0; i < 10; i++) {
            text += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62))
        }
        return text
    }

    function getStyleTree(elem, cssProps, depth) {
        if (!(typeof depth === "number")) depth = 3;
        if (elem.nodeType === 1 && depth > 0) {
            elem.__id = Math.floor(Math.random() * 1e8);
            var tree = {
                style: {},
                children: {}
            };
            cssProps.forEach(function(prop) {
                tree.style[prop] = $(elem).css(prop)
            });
            elem.childNodes.forEach(function(child) {
                var subtree = getStyleTree(child, cssProps, depth - 1);
                if (subtree) tree.children[child.__id] = subtree
            });
            return tree
        }
    }

    function compareStyle(elem, styleTree) {
        if (elem.nodeType === 1) {
            var result = {
                style: {},
                children: {}
            };
            Object.keys(styleTree.style).forEach(function(prop) {
                var current = $(elem).css(prop);
                if (current !== styleTree.style[prop]) result.style[prop] = [styleTree.style[prop], current]
            });
            elem.childNodes.forEach(function(child) {
                if (child.__id) {
                    var subtree = compareStyle(child, styleTree.children[child.__id]);
                    if (subtree) result.children[child.__id] = subtree
                }
            });
            return result
        }
    }

    function collectStyleDiff(diffTree, prop) {
        var result = [];
        if (prop in diffTree.style) result.push(prop + ' change "' + diffTree.style[prop][0] + '" -> "' + diffTree.style[prop][1] + '"');
        Object.keys(diffTree.children).forEach(function(child_id) {
            result = result.concat(collectStyleDiff(diffTree.children[child_id], prop))
        });
        return result
    }

    function searchEventListener(element, eventName, matchFunc) {
        if (element["on" + eventName]) {
            var onEvent = element["on" + eventName];
            if (matchFunc(onEvent.toString())) {
                return onEvent
            }
        } else if (element.__listeners) {
            var listeners = element.__listeners[eventName];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    var onEvent = listeners[i];
                    if (matchFunc(onEvent.toString())) {
                        return onEvent
                    }
                }
            }
        }
    }

    function test1A() {
        var marks = 0;
        var comments = [];
        if (!renderProduct || typeof renderProduct !== "function") {
            comments.push("missing renderProduct function")
        } else {
            var testStock = {
                foo: {
                    label: randKey(),
                    imageUrl: randKey() + ".png",
                    price: Math.round(1e7 * Math.random()),
                    quantity: 5
                }
            };
            var testStore = new Store(testStock);
            testStore.cart = {
                foo: 0
            };
            var container = $('<div><div class="replace-test-dummy"></div><div class="replace-test-dummy"></div></div>')[0];
            renderProduct(container, testStore, "foo");
            var remaining = $(".replace-test-dummy", container).length;
            if (remaining > 0) comments.push("should replace the contents of the given container");
            else marks += 1 / 2;
            var image = $("img", container)[0];
            if (image && image.src.indexOf(testStock["foo"].imageUrl) >= 0) marks += 1 / 2;
            else comments.push("not generating the correct product image");
            if (container.innerHTML.indexOf(testStock["foo"].label) < 0) comments.push("not generating the correct product label");
            else marks += 1 / 2;
            if (container.innerHTML.indexOf(testStock["foo"].price) < 0) comments.push("not generating the correct product price");
            else marks += 1 / 2;
            var addButton, removeButton;
            addButton = $(".btn-add", container);
            removeButton = $(".btn-remove", container);
            if (addButton.length === 0) comments.push("not generating add button (button.btn-add) when there is item in stock");
            else marks += 1 / 2;
            if (removeButton.length > 0) comments.push("generating remove button (button.btn-remove) when there is zero item in cart");
            else marks += 1 / 2;
            testStore.stock["foo"].quantity = 0;
            testStore.cart["foo"] = 5;
            renderProduct(container, testStore, "foo");
            addButton = $(".btn-add", container);
            removeButton = $(".btn-remove", container);
            if (addButton.length > 0) comments.push("generating add button (button.btn-add) when there is zero item in stock");
            else marks += 1 / 2;
            if (removeButton.length === 0) comments.push("not generating remove button (button.btn-remove) when there is item in cart");
            else marks += 1 / 2
        }
        return Promise.resolve({
            marks: marks,
            comments: comments
        })
    }

    function test1B() {
        var marks = 0;
        var comments = [];
        if (!renderProductList || typeof renderProductList !== "function") {
            comments.push("missing renderProductList function")
        } else {
            var testStock = {
                foo: {
                    label: randKey(),
                    imageUrl: randKey() + ".png",
                    price: Math.round(1e7 * Math.random()),
                    quantity: 4
                },
                bar: {
                    label: randKey(),
                    imageUrl: randKey() + ".png",
                    price: Math.round(1e7 * Math.random()),
                    quantity: 1
                }
            };
            var testStore = new Store(testStock);
            testStore.cart = {
                foo: 1,
                bar: 4
            };
            var container = $('<div><div class="replace-test-dummy"></div><div class="replace-test-dummy"></div></div>')[0];
            renderProductList(container, testStore);
            var remaining = $(".replace-test-dummy", container).length;
            if (remaining > 0) comments.push("should replace the contents of the given container");
            else marks += 1 / 3;
            var addButtons = $(".btn-add", container);
            var removeButtons = $(".btn-remove", container);
            if (!(addButtons.length === 2 && removeButtons.length === 2)) comments.push("number of product boxes generated by renderProductList does not match the stock");
            else marks += 1 / 3;
            var productFoo = $("#product-foo", container);
            var productBar = $("#product-bar", container);
            if (productFoo.length === 0 || productBar.length === 0) comments.push('cannot find ids on the product boxes (e.g. "product-foo")');
            else marks += 1 / 3
        }
        return Promise.resolve({
            marks: marks,
            comments: comments
        })
    }

    function test2() {
        var marks = 0;
        var comments = [];
        var productView = $("#productView")[0];
        if (productView) {
            var testStore = new Store(products);
            var container = $("<div></div>")[0];
            renderProductList(container, testStore);
            if (productView.innerHTML != container.innerHTML) {
                comments.push('#productView should be rendered using "renderProductList"')
            } else {
                marks = 1
            }
        } else {
            comments.push("cannot find #productView")
        }
        return Promise.resolve({
            marks: marks,
            comments: comments
        })
    }

    function test3() {
        var marks = 0;
        var comments = [];
        var testStock = {
            foo: {
                label: randKey(),
                imageUrl: randKey() + ".png",
                price: Math.round(1e7 * Math.random()),
                quantity: 4
            },
            bar: {
                label: randKey(),
                imageUrl: randKey() + ".png",
                price: Math.round(1e7 * Math.random()),
                quantity: 1
            }
        };
        var testStore = new Store(testStock);
        testStore.cart = {
            foo: 1,
            bar: 4
        };
        if (testStore.onUpdate === undefined) {
            comments.push('store does not have "onUpdate" property')
        } else if (testStore.onUpdate !== null) {
            comments.push('store not initializing ".onUpdate" property with null')
        } else marks += 2 / 5;
        var check = Math.random();
        var callbackValue = undefined;
        testStore.onUpdate = function() {
            callbackValue = check
        };
        testStore.addItemToCart("foo");
        if (callbackValue !== check) {
            comments.push("addItemToCart is not calling .onUpdate function")
        } else marks += 2 / 5;
        check = Math.random();
        testStore.removeItemFromCart("foo");
        if (callbackValue !== check) {
            comments.push("removeItemFromCart is not calling .onUpdate function")
        } else marks += 2 / 5;
        if (!(store.onUpdate instanceof Function)) {
            comments.push("store.onUpdate not assigned a callback function")
        } else {
            marks += 2 / 5;
            var productBox = $("#product-Box1");
            productBox.append('<div class="replace-test-dummy"></div><div class="replace-test-dummy"></div><div class="replace-test-dummy"></div>');
            store.onUpdate("Box1");
            var dummies = $(".replace-test-dummy", productBox);
            if (dummies.length > 0) {
                comments.push("store.onUpdate is not invoking renderProduct")
            } else {
                marks += 2 / 5
            }
        }
        return Promise.resolve({
            marks: marks,
            comments: comments
        })
    }

    function test4() {
        var marks = 0;
        var comments = [];
        if (!renderCart || typeof renderCart !== "function") {
            comments.push("missing renderCart function")
        } else {
            var testStock = {
                foo: {
                    label: randKey(),
                    imageUrl: randKey() + ".png",
                    price: Math.round(1e7 * Math.random()),
                    quantity: 4
                },
                bar: {
                    label: randKey(),
                    imageUrl: randKey() + ".png",
                    price: Math.round(1e7 * Math.random()),
                    quantity: 1
                }
            };
            var testStore = new Store(testStock);
            testStore.cart = {
                foo: Math.round(1e3 * Math.random()),
                bar: Math.round(1e3 * Math.random())
            };
            var container = $('<div><div class="replace-test-dummy"></div><div class="replace-test-dummy"></div></div>')[0];
            renderCart(container, testStore);
            var remaining = $(".replace-test-dummy", container).length;
            if (remaining > 0) comments.push("should replace the contents of the given container");
            else marks += 4 / 5;
            if (container.innerHTML.indexOf(testStock["foo"].label) < 0 || container.innerHTML.indexOf(testStock["bar"].label) < 0) {
                comments.push("not generating entries for cart items")
            } else marks += 4 / 5;
            if (container.innerHTML.indexOf(testStore.cart["foo"]) < 0 || container.innerHTML.indexOf(testStore.cart["bar"]) < 0) {
                comments.push("not showing quantity for each item")
            } else marks += 4 / 5;
            var btns = $("button", container);
            if (btns.length < 4) comments.push("not generating +/- buttons");
            else marks += 4 / 5;
            var totalPrice = testStock["foo"].price * testStore.cart["foo"] + testStock["bar"].price * testStore.cart["bar"];
            if (container.innerHTML.indexOf(totalPrice) < 0) comments.push("cannot find total price");
            else marks += 4 / 5
        }
        return Promise.resolve({
            marks: marks,
            comments: comments
        })
    }

    function test5() {
        var marks = 0;
        var comments = [];
        var modalDiv = $("#modal")[0];
        if (!modalDiv) comments.push("cannot find #modal");
        else marks += 3 / 8;
        var modalContent = $("#modal #modal-content")[0];
        if (!modalContent) comments.push("cannot find #modal-content");
        else marks += 3 / 8;
        var hideCartBtn = $("#modal #btn-hide-cart")[0];
        if (!hideCartBtn) comments.push("cannot find #btn-hide-cart");
        else marks += 3 / 8;
        if (!showCart || !(showCart instanceof Function)) comments.push("cannot find showCart function");
        else {
            var styleTree = getStyleTree(modalDiv, ["display", "visibility"]);
            $(modalContent).append('<div class="replace-test-dummy"></div><div class="replace-test-dummy"></div><div class="replace-test-dummy"></div>');
            showCart();
            var diffTree = compareStyle(modalDiv, styleTree);
            var displayChange = collectStyleDiff(diffTree, "display");
            var visibilityChange = collectStyleDiff(diffTree, "visibility");
            console.log(styleTree, diffTree, displayChange, visibilityChange);
            if (displayChange.length > 0 || visibilityChange.length > 0) marks += 3 / 8;
            else comments.push("modal not shown upon calling showCart()");
            var dummies = $(".replace-test-dummy", modalContent);
            if (dummies.length > 0) comments.push("showCart is not invoking renderCart, or renderCart is not updating #modal-content");
            else marks += 3 / 8;
            if (!hideCart || !(hideCart instanceof Function)) comments.push("cannot find hideCart function");
            else {
                var listener = searchEventListener(hideCartBtn, "click", function(funcBody) {
                    return funcBody.indexOf("hideCart") > -1
                });
                if (listener) marks += 3 / 8;
                else comments.push("#btn-hide-cart does not trigger hideCart function");
                styleTree = getStyleTree(modalDiv, ["display", "visibility"]);
                hideCart();
                diffTree = compareStyle(modalDiv, styleTree);
                displayChange = collectStyleDiff(diffTree, "display");
                visibilityChange = collectStyleDiff(diffTree, "visibility");
                console.log(styleTree, diffTree, displayChange, visibilityChange);
                if (displayChange.length > 0 || visibilityChange.length > 0) marks += 3 / 8;
                else comments.push("modal not hidden upon calling hideCart()");
                $(modalContent).append('<div class="replace-test-dummy"></div><div class="replace-test-dummy"></div><div class="replace-test-dummy"></div>');
                store.onUpdate("Box1");
                dummies = $(".replace-test-dummy", modalContent);
                if (dummies.length > 0) comments.push("store.onUpdate is not invoking renderCart");
                else marks += 3 / 8
            }
        }
        return Promise.resolve({
            marks: marks,
            comments: comments
        })
    }
    var TESTS = {
        "1A": {
            test: test1A,
            max: 4
        },
        "1B": {
            test: test1B,
            max: 1
        },
        2: {
            test: test2,
            max: 1
        },
        3: {
            test: test3,
            max: 2
        },
        4: {
            test: test4,
            max: 4
        },
        5: {
            test: test5,
            max: 3
        }
    };

    function runTests(keys, suite) {
        if (!suite) suite = {};
        if (keys.length > 0) {
            var testKey = keys[0];
            try {
                return TESTS[testKey].test().then(function(result) {
                    suite[testKey] = result;
                    alert("Task " + testKey + ": " + result.marks.toFixed(1) + "/" + TESTS[testKey].max + "\n" + result.comments.join("\n"));
                    return runTests(keys.slice(1), suite)
                }).catch(function(error) {
                    alert(error.message)
                })
            } catch (error) {
                alert("Task " + testKey + " encountered an Error");
                console.error(error);
                return Promise.resolve(suite)
            }
        } else return Promise.resolve(suite)
    }
    var user_tests = window.localStorage.getItem("selectedTests");
    if (user_tests) user_tests = JSON.parse(user_tests);
    else user_tests = Object.keys(TESTS).reduce(function(acc, key) {
        acc[key] = true;
        return acc
    }, {});
    var widget = $("<div></div>");
    widget.css({
        position: "fixed",
        top: "0px",
        right: "0px"
    });
    var btn = $("<button></button>");
    btn.text("Run Test");
    btn.css({
        background: "#f00",
        color: "#fff",
        padding: "8px",
        border: "none"
    });
    var toggle = $("<button></button>");
    toggle.text("Select");
    toggle.css({
        background: "#faa",
        color: "#000",
        padding: "8px",
        border: "none"
    });
    var options = $("<div></div>");
    Object.keys(TESTS).sort().forEach(function(key) {
        var checked = user_tests[key] ? " checked" : "";
        var opt = $('<div><input type="checkbox" value="' + key + '"' + checked + "/>Task " + key + "</div>");
        options.append(opt)
    });
    options.css({
        display: "none"
    });
    btn.on("click", function() {
        var selection = {};
        var tests = [];
        $("input", options).each(function(index) {
            if (this.checked) {
                selection[this.value] = true;
                tests.push(this.value)
            } else {
                selection[this.value] = false
            }
        });
        window.localStorage.setItem("selectedTests", JSON.stringify(selection));
        tests.sort();
        runTests(tests).then(function(suite) {
            alert("All Tests Finished");
            var msg = Object.keys(suite).map(function(key) {
                return key + ": " + suite[key].marks.toFixed(1) + "/" + TESTS[key].max + "\n" + suite[key].comments.map(function(txt) {
                    return "    " + txt
                }).join("\n")
            }).join("\n");
            alert(msg)
        }).catch(function(error) {
            alert(error.message)
        })
    });
    toggle.on("click", function() {
        options.toggle()
    });
    widget.append(btn);
    widget.append(toggle);
    widget.append(options);
    $(document.body).append(widget)
});