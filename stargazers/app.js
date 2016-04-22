var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;

//set up sessions
var sessionOptions = {
	secret: 'secret cookie thang',
	resave: true,
	saveUninitialized: true
};

//print in database code
require('./db.js');
//get User for passport authentication
var mongoose = require('mongoose');
var User = mongoose.model('User');


var login = require('./routes/login');
var user = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionOptions));

//CONFIGURE PASSPORT FOR USER AUTHENTICATION
app.use(passport.initialize());
app.use(passport.session());


//regular user-login
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

//facebook login
passport.use(new FacebookStrategy({
    clientID: 1560296170929426,
    clientSecret: '226542e3a1d276aab0759b3e23085a81',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
		profileFields: ['id','emails', 'first_name', 'last_name', 'displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    //do some req.session shit?
    var name = profile.displayName;
    User.findOrCreate({name:name}, function(err, user, created){
      console.log(user.name + " " + user.username);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use('/', login);
app.use('/', user);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
