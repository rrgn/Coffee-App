var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Coffee-users');

var User = require('./user.js');

var regan = new User({
  _id: "Regan",
  encryptedPassword: "asdfasdf",
  authenticationTokens: ["jkljlk"],
  orders: {
    options: {
      grind: "medium",
      quantity: 0.5
    },
    address: {
      name: "Foo Bar",
      address: "123 Foo Bar St",
      address2: null,
      city: "foo",
      state: "GA",
      zipCode: "30309",
      deliveryDate: "7/21/2016"
    }
  }
});

regan.save(function(err) {
  if (err) {
    console.log('Error is: ', err.message);
    console.log(err.errors);
    return;
  }
  console.log("saved", regan);
});
