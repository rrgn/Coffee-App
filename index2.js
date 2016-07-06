// var mongo = require('mongo');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Coffee-users');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var User = require('./user');
var randtoken = require('rand-token');


app.use(express.static('public'));
app.use(bodyParser.json());

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

app.post('/login', function(request, response) {
  var data = request.body;
  var userPassword = data.password;
  User.findOne( { _id: data.username }, function(err, user) {
    if (err) {
      console.log("error in finding user", err);
      return;
    }
    console.log("found user: ", user);
    var encryptedPassword = user.encryptedPassword;
    bcrypt.compare(userPassword, encryptedPassword, function(err, matched) {
      if (err) {
        console.error(err.message);
        return;
      }
      if (matched) {
        var token = randtoken.generate(64);
        response.json({
          status: 'ok',
          token: token
        });
        var tokenArray = user.authenticationTokens;
        tokenArray.push(token);
        console.log(tokenArray);
        console.log('You are logged in!');
        user.save(function(err) {
          if (err) {
            console.log('error in saving token: ', err);
            response.status(409);
            response.json({
              status: "fail",
              message: "Username is taken"
            });
            return;
          }
        });
      } else {
        response.json({
          status: 'fail',
          message: 'Invalid username or password'
        });
        console.log('Invalid password');
      }
    });
  });
});

app.post('/orders', function(request, response) {
  var data = response.body;
  console.log(data);
  response.send(data);
});

app.listen(3000, function() {
  console.log("listening on port 3000");
});
