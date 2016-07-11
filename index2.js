// var mongo = require('mongo');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Coffee-users');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var stripe = require('stripe')('sk_test_EvFD6hRFhXazjj9XCPomjqdo');
var bcrypt = require('bcrypt');
var User = require('./user');
var randtoken = require('rand-token');
var cors = require('cors');

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// get grind options
app.get('/options', function(request, response) {
  response.json(
    [
      "Extra coarse",
    	"Coarse",
    	"Medium-coarse",
    	"Medium",
    	"Medium-fine",
    	"Fine",
    	"Extra fine"
    ]
  );
});
// sign up user
app.post('/signup', function(request, response) {
  var data = request.body;
  var userPassword = data.password;

bcrypt.hash(userPassword, 10, function(err, encryptedPassword) {
    if (err) {
      console.log(err.message);
      return;
      }
        console.log('password: ', userPassword);
        console.log('encryptedPassword:', encryptedPassword);
    var user = new User({
      _id: data.username,
      encryptedPassword: encryptedPassword
    });
    user.save(function(err) {
      if (err) {
        console.log('error in save: ', err);
        response.status(409);
        response.json({
          status: "fail",
          message: "Username is taken"
        });
        return;
      }
      response.json({ status: "ok" });
    });
  });
});

// check user login
app.post('/login', function(request, response) {
  var data = request.body;
  var userPassword = data.password;
  User.findOne( { _id: data.username }, function(err, user) {
    if (!user) {
      response.json({
        status: 'fail',
        message: 'Invalid username or password'
      });
      return;
    }

    var encryptedPassword = user.encryptedPassword;
    bcrypt.compare(userPassword, encryptedPassword, function(err, matched) {
      if (err || !matched) {
        response.json({
          status: 'fail',
          message: 'Invalid username or password'
        });
        return;
      }
      var token = randtoken.generate(64);
      var tokenArray = user.authenticationTokens;
      tokenArray.push(token);
        user.save(function(err) {
        if (err || !matched) {
          response.json({
            status: "fail",
            message: "Invalid username or password"
          });
          return;
        }
        response.json({
          status: 'ok',
          token: token
        });
      });
    });
  });
});

app.post('/orders', function(request, response) {
  var result = request.body;
  var token = result.token;
  User.findOne({ authenticationTokens: token }, function(err, user) {
    if(!user) {
      response.json({
        status: "fail",
        message: "user not logged in"
      });
      return;
    }
    user.orders.push(result.order);
    // console.log(result.order);
    // console.log(request.body.order);
    user.save(function(err) {
      if (err) {
        response.json({
          status: "failed",
          message: "Order failed " + err.message + JSON.stringify(err.errors)
        });
        return;
      }
      response.send('Place Order');
    });
  });
});

function authRequired(request, response, next) {
  var token = request.query.token || request.body.token;
  console.log(token);
  User.findOne({authenticationTokens: token}, function(err,user) {
    request.user = user;
    if (err) {
      request.send(err.message);
      return;
    }
    if(user) {
      next();
    } else {
      response.json({message: 'please login'});
    }
  });
}

app.get('/orders', authRequired, function(request, response) {
  // var result = request.body;
  // var token = request.query.token;
  // User.findOne({ authenticationTokens: token }, function(err, user) {
  //   if(!user) {
  //     response.json({
  //       status: "fail",
  //       message: "user not logged in"
  //     });
  //     return;
  //   }
  // });
  response.send('ok', request.user.orders);
});

// stripe payment
app.post('/charge', function(request, response) {
  var amount = request.body.amount;
  var token = request.body.token;

  // make the charge using the credit card associated
  // with token
  stripe.charges.create({
    amount: amount,
    currency: 'usd',
    source: token
  }, function(err, charge) {
    if (err) {
      response.json({
        status: 'fail',
        error: err.message
      });
      return;
    }
    response.json({ status: 'ok', charge: charge });
  });
});


app.listen(8080, function() {
  console.log("listening on port 8080");
});
