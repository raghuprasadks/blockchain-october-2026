function add(n1,n2){
    return n1+n2
}

let total =add(10,20)
console.log("add - normal function",total)

// Arrow function equivalent
const addArrow = (n1, n2) => n1 + n2;
total = addArrow(10, 20);   
console.log("add - arrow function", total);

console.log("Arrow function in setInterval -  before setInterval");
setInterval(() => {
    console.log("Arrow function in setInterval");
}, 1000);

console.log("Arrow function in setInterval - outside of setInterval");