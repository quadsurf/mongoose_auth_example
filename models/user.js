var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    email: {
      type: String,
      lowercase: true,
      required: true,
      index: {
        unique: true
      }
    },
    password: {
      type: String,
      required: true
    },
    first_name: {
      type: String,
      default: ""
    },
    last_name: {
      type: String,
      default: ""
    }
  });

userSchema.pre('save', function(next) {
  var user = this;
  // console.log(user.password)
  if (!user.isModified('password')) {
    return next();
  }
  return bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }
    return bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      console.log("THIS IS THE NEW HASH", hash)
      return next();
    });
  });
});

userSchema.statics.authenticate = function (params, cb) {
  this.findOne({
      email: params.email
    },
    function (err, user) {
      user.checkPswrd(params.password, cb);
    });
};

userSchema.methods.checkPswrd = function(password, cb) {
  var user = this;
  console.log(bcrypt.compareSync(password, this.password))
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (isMatch) {
      cb(null, user);
    } else {
      cb(err, null);
    }
  });
};

var User = mongoose.model("User", userSchema);



module.exports = User;