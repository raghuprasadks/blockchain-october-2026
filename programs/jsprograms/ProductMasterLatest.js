function product(code, name, description, price,supplier){
    this.code = code;
    this.name = name;
    this.description = description;
    this.price = price;
    this.supplier = supplier;   
    this.display = function(){
        console.log("Product Code: " + this.code);
        console.log("Product Name: " + this.name);
        console.log("Product Description: " + this.description);
        console.log("Product Price: " + this.price);
        console.log("Product Supplier: " + this.supplier);
    };  
    this.searchBySupplier = function(supplierName){
        if(this.supplier === supplierName){            
            return true;
        } else {
            return false;
        } 
    };
}
product1 = new product("P001", "Laptop", "A high-performance laptop", 1200, "Samsung");
product2 = new product("P002", "Smartphone", "A latest model smartphone", 800, "Gadget World");
product3 = new product("P003", "Headphones", "Noise-cancelling headphones", 150, "Audio Excellence");
product4 = new product("P004", "Tablet", "A sleek and powerful tablet", 500, "Samsung");

cart=[]
cart.push(product1);
cart.push(product2);
cart.push(product3);
cart.push(product4);    
console.log("The products in the cart are: ");
for(var i=0; i<cart.length; i++){
    cart[i].display();
}
totalPrice = 0;
for(var i=0; i<cart.length; i++){
    totalPrice += cart[i].price;
}
console.log("The total price of the cart is: " + totalPrice);

console.log("Searching for products by supplier 'Samsung':");
foundProducts = [];
for(var i=0; i<cart.length; i++){
    if(cart[i].searchBySupplier("Samsung")){
        foundProducts.push(cart[i]);
    }
}
console.log("Products found:");
for(var i=0; i<foundProducts.length; i++){
    foundProducts[i].display();
}
