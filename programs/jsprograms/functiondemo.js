function greet(){
    console.log("Hello, welcome to the function demo!")
}
greet()

function add(n1,n2){
    result = n1+n2
    console.log("The result of addition is: " + result)    
}
add(5,19)

function subtract(n1,n2){
    let result = n1-n2
    return result    
}
let calcresult=subtract(10,5)
console.log("The result of subtraction is: " + calcresult)
let arrowSubtract = (n1, n2) => n1 - n2
console.log("The result of arrow subtraction is: " + arrowSubtract(20, 8))

/**
 * 1. Write a function to calculate simpleinterest
 * using regular and arrow function
 * use p,r,t as parameters
 */


/**
 * 2. Write a program to simulate a calculator using functions
 * add, subtract, multiply, divide using arrow functions
 * get the user input and display the result in the console
 */

let arrowSimpleInterest = (p, r, t) => (p * r * t) / 100;

function simpleInterest(p, r, t){
    let interest = (p * r * t) / 100;
    return interest;
}
let p=Number(process.argv[2]);
let r=Number(process.argv[3]);
let t=Number(process.argv[4]);
let interest = simpleInterest(p, r, t);
console.log("The simple interest is: " + interest);
// node functiondemo.js 10000 5 2