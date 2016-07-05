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
  console.log(data);
  var user = data.username;
  User.findOne({ _id: user }, function(err, user) {
    if (err) {
      console.error(err.message);
      return;
    }
    if (user) {
      response.json({
        status: "fail",
        message: "username taken"
      });
    } else {
      response.json({status: "ok"});
      User.create({_id: user}, function(err,user) {
        if (err) {
          return;
        }
      });
    }
    // console.log('Found users:', user);
  });
});

app.listen(3000, function() {
  console.log("listening on port 3000");
});
