function Store(initialStock) {
    this.stock = initialStock;
    this.cart = [];
    this.addItemToCart = function(itemName) {

    }
    this.removeItemFromCart = function(itemName) {

    }
}
var productsArray = [
    "Box1",
    "Box2",
    "Clothes1",
    "Clothes2",
    "Jeans",
    "KeyboardCombo",
    "Keyboard",
    "Mice",
    "PC1",
    "PC2",
    "PC3",
    "Tent"
];

function Product(label, imageUrl, price, quantity) {
    this.label = label;
    this.price = price;
    this.imageUrl = imageUrl;
    this.quantity = quantity;
}