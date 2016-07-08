// var mongo = require('mongo');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Coffee-users');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var User = require('./user');

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
      bcrypt.hash(userPassword, 10, function(err, encryptedPassword) {
        if (err) {
          console.log(err.message);
          return;
        }
        console.log('password: ', userPassword);
        console.log('encryptedPassword:', encryptedPassword);
      });
      response.json({ status: "ok" });
  });
});

app.listen(8080, function() {
  console.log("listening on port 8080");
});
