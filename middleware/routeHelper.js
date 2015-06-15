var db = require("../models");

var routeHelpers = {
  ensureLoggedIn: function(req, res, next) {
    if (req.session.id !== null) {
      return next();
    }
    else {
     res.redirect('/login');
    }
  },

  ensureCorrectUser: function(req, res, next) {

    db.Puppy.findById(req.params.id,function(err,puppy){
      if (puppy.ownerId !== req.session.id) {
        res.redirect('/puppies');
      }
      else {
       return next();
      }
    });
  },

  preventLoginSignup: function(req, res, next) {
    if (req.session.id !== null) {
      res.redirect('/puppies');
    }
    else {
     return next();
    }
  }
};
module.exports = routeHelpers;