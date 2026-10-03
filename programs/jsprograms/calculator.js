function calculate(){
            console.log("Calculating...");
            var num1 = parseFloat(document.getElementById("num1").value);
            var num2 = parseFloat(document.getElementById("num2").value);
            var operation = document.getElementById("operation").value;
            console.log("Num1: " + num1);
            console.log("Num2: " + num2);
            console.log("Operation: " + operation); 
            result = 0;
            if(operation === "add"){
                result = num1 + num2;
            } else if(operation === "subtract"){
                result = num1 - num2;
            } else if(operation === "multiply"){
                result = num1 * num2;
            } else if(operation === "divide"){
                result = num1 / num2;
            }
            console.log("Result: " + result);
            document.getElementById("result").innerText = "Result: " + result;
        }