function product(code, name, description, price){
    this.code = code;
    this.name = name;
    this.description = description;
    this.price = price;
    display = function(){
        console.log("Product Code: " + this.code);
        console.log("Product Name: " + this.name);
        console.log("Product Description: " + this.description);
        console.log("Product Price: " + this.price);
    }   
}

product1 = new product("P001", "Laptop", "A high-performance laptop", 1200);
product2 = new product("P002", "Smartphone", "A latest model smartphone", 800);
product3 = new product("P003", "Headphones", "Noise-cancelling headphones", 150);

cart=[]
cart.push(product1);
cart.push(product2);
cart.push(product3);
console.log("The products in the cart are: ");

totalPrice = 0;
for(var i=0; i<cart.length; i++){
    totalPrice += cart[i].price;
}
console.log("The total price of the cart is: " + totalPrice);
