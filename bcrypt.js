var bcrypt = require('bcrypt');

var userPassword = "password";
var saltRounds = 10;

bcrypt.hash(userPassword, saltRounds, function(err, encryptedPassword) {
  if (err) {
    console.log(err.message);
    return;
  }
  console.log('Password: ', userPassword);
  console.log('Encrypted Password: ', encryptedPassword);
});
