var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "NeverGiveUp70",
    database: "bamazon"

});



// var subtotal = 0;
var shipping = 0;
var tax = 0;
var total = 0;



connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    showInventory();
    placeOrder();
});


var showInventory = function() {
    connection.query("SELECT * FROM products", function(err, res) {

        // console.log(res);

        // for (var i = 0; i < res.length; i++) {

        //     console.log("Item ID: ", res[i].item_id, "|", "Description: ", res[i].product_name, "|", "Price: ", res[i].price);
        // }
        var table = new Table({
            head: ['Item ID', 'Description', 'price', 'Quantity']
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity])
        };
        console.log(table.toString());
    });
}

var placeOrder = function() {
    connection.query("SELECT * FROM products", function(err, res) {

        // console.log(res);


        inquirer.prompt({
            name: "inventory",
            type: "input",
            message: "Please insert item id of the item you like to buy",
        }).then(function(answer) {

            for (var i = 0; i < res.length; i++) {
                if (parseInt(answer.inventory) === res[i].item_id) {
                    var itemId = res[i].item_id;
                    var description = res[i].product_name;
                    var stockQuantity = res[i].stock_quantity;
                    var unitPrice = res[i].price;
                    console.log("You chose ", res[i].product_name, "Price: $", res[i].price);
                    if (stockQuantity > 1) {
                        console.log("We have " + stockQuantity + " units avaialble. ");
                    } else if (stockQuantity === 1) {
                        console.log("We have only one usnit left in stock");
                    } else if (stockQuantity === 0) {
                        console.log("sorry .. we are out of stock .. check us later");
                        placeOrder();

                    }
                    inquirer.prompt({
                        name: "quantity",
                        type: "input",
                        message: "Please insert the quantity needed",
                        validate: function(value) {

                            if (value > 0) {
                                return true;
                            }
                            return 'Quantity needs to be at least 1';
                        },
                    }).then(function(answer) {

                        if (answer.quantity > stockQuantity) {
                            if (stockQuantity > 1) {
                                console.log("sorry, only " + stockQuantity + " units avaialble" + " Please order up to" + stockQuantity);
                                keepShoping();
                                // placeOrder();
                            } else if (stockQuantity === 1) {
                                console.log("sorry, Only one usnit left in stock");
                                keepShoping();
                                // placeOrder();
                                // } else if (stockQuantity === 0) {
                                //     console.log("sorry .. we are out of stock .. check us later");
                                //     keepShoping();
                                //     // placeOrder();

                            };
                        } else {

                            var subtotal = parseInt(unitPrice) * parseInt(answer.quantity);

                            total += subtotal;
                            connection.query("UPDATE products SET ? WHERE ?", [{
                                stock_quantity: stockQuantity - parseInt(answer.quantity),
                            }, {
                                item_id: itemId
                            }], function(err, res) {

                            });
                            console.log("your subtotal is $", total);
                            keepShoping();
                            // placeOrder();

                        };

                        // ////////////////////////end of else 

                    });
                };
            };
        });

    });

};


// validate function
var validate = function(value) {

    if (value > 0) {
        return true;
    }
    return 'Quantity needs to be more than 1';
}
var keepShoping = function() {
    inquirer.prompt({
        name: "shopping",
        type: "list",
        message: "Would you like to keep shopping?",
        choices: ["Yes .. keep shopping", "No quit"]
    }).then(function(answer) {
        if (answer.shopping === "Yes .. keep shopping") {
            placeOrder();
        } else {
            connection.end(function(err) {

            });
        }

    });
}
