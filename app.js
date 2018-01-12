var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
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
var List = mongoose.model('List');


var login = require('./routes/login');
var user = require('./routes/user');
var list = require('./routes/list');

var app = express();

// Retrieve client ID and Secret from config
require('dotenv').config();
const clientID = process.env.clientID;
const clientSecret = process.env.clientSecret;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionOptions));

//CONFIGURE PASSPORT FOR USER AUTHENTICATION
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  console.log('handling request for: ' + req.url + "\n\n");
  next();
});


//Set up strategies for user authentication:
//regular username-password login
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
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
		profileFields: ['id', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
		var password = profile.id;
		var firstName = profile.name.givenName;
		var lastName = profile.name.familyName;

    User.findOne({fb:true, password: password}, function(err, user, created){
				if(!user){ //create user!
					var username = profile.username;
					if(username === undefined){
						username = firstName + "-" + lastName;
					}
					var newUser = new User({
			      name: firstName + " " + lastName,
						fb: true,
			      username: username,
			      password: password,
			    });
					newUser.save(function(err){
						if (err) console.log(err);
						//create the 2 default lists for each user
			      var d = new Date();
			      d = d.toString();
			      var nasaList = new List({
			        user: newUser._id,
			        name: "nasaObserved",
			        created: d.toString()
			      });
			      var userList = new List({
			        user: newUser._id,
			        name: "userObserved",
			        created: d
			      });

			      //save to lists collection
			      nasaList.save(function(err, list, count){
			        if(err){ res.render('error', {error: err});}
			        console.log("NASA list saved");
			      });
			      userList.save(function(err, list, count){
			        if(err){ res.render('error', {error: err});}
			        console.log("User list saved");
			      });
			      //save list id's for findOne
			      var nasaID = nasaList._id;
			      var userID = userList._id;

			      //populate list objects (i.e. populate user reference with new user)
			      List.findOne({_id : nasaID}).populate('user').exec(function(err, list){
			        if(err){ res.render('error', {error: err});}
			        console.log("User for NASA list populated with id: " + list.user);
			      });
			      List.findOne({_id : userID}).populate('user').exec(function(err, list){
			        if(err){ res.render('error', {error: err});}
			        console.log("User for User list populated with id: " + list.user);
			      });


			      //now reverse - save the 2 lists in the array of lists in the user schema
			      newUser.lists.push(nasaList);
			      newUser.lists.push(userList); //FIXME?

            return done(null, newUser);
					});
				}else if(user.username.indexOf('undefined') !== -1){
					user.username = firstName + "-" + lastName;
					user.save(function(err){
						if (err) console.log(err);
						return done(null, user);
					});
				}else{
					console.log("user is now: " + user);
      		return done(null, user);
				}
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findOne({_id:id}, function(err, user){
		// console.log("User found from deserializer: " + user);
		done(err, user);
	});
});

app.use('/', login);
app.use('/', user);
app.use('/', list);



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
