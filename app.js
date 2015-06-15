var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    db = require("./models"),
    methodOverride = require("method-override"),
    session = require("cookie-session"),
    morgan = require("morgan"),
    loginMiddleware = require("./middleware/loginHelper");
    routeMiddleware = require("./middleware/routeHelper");

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  maxAge: 3600000,
  secret: 'illnevertell',
  name: "chocolate chip"
}));

// use loginMiddleware everywhere!
app.use(loginMiddleware);

app.get('/', routeMiddleware.ensureLoggedIn, function(req,res){
  res.render('users/index');
});

app.get('/signup', routeMiddleware.preventLoginSignup ,function(req,res){
  res.render('users/signup');
});

app.post("/signup", function (req, res) {
  var newUser = req.body.user;
  db.User.create(newUser, function (err, user) {
    if (user) {
      req.login(user);
      res.redirect("/puppies");
    } else {
      console.log(err);
      // TODO - handle errors in ejs!
      res.render("users/signup");
    }
  });
});


app.get("/login", routeMiddleware.preventLoginSignup, function (req, res) {
  res.render("users/login");
});

app.post("/login", function (req, res) {
  db.User.authenticate(req.body.user,
  function (err, user) {
    if (!err && user !== null) {
      req.login(user);
      res.redirect("/puppies");
    } else {
      // TODO - handle errors in ejs!
      res.render("users/login");
    }
  });
});

app.get('/puppies', routeMiddleware.ensureLoggedIn, function(req,res){
    db.Puppy.find({}, function(err,puppies){
      res.render("puppies/index", {puppies: puppies});
    });
});

app.post('/puppies', routeMiddleware.ensureLoggedIn, function(req,res){
  var puppy = new db.Puppy(req.body.puppy);
  puppy.ownerId = req.session.id;
  puppy.save(function(err,puppy){
    res.redirect("/puppies");
  });
});

app.get('/puppies/new', function(req,res){
  res.render("puppies/new");
});

app.get('/puppies/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Puppy.findById(req.params.id, function(err,puppy){
    res.render("puppies/show", {puppy:puppy});
  });
});

app.get('/puppies/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function(req,res){
  db.Puppy.findById(req.params.id, function(err,puppy){
    res.render("puppies/edit", {puppy:puppy});
  });
});

app.put('/puppies/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Puppy.findByIdAndUpdate(req.params.id, req.body.puppy, function(err,puppy){
    res.redirect('/puppies');
  });
});

app.delete('/puppies/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Puppy.findByIdAndRemove(req.params.id, function(err,puppy){
    res.redirect('/puppies');
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get('*', function(req,res){
  res.render('errors/404');
});

app.listen(3000, function(){
  console.log("Server is listening on port 3000");
});
