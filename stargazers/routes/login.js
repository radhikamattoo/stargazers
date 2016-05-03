var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
LocalStrategy = require('passport-local').Strategy;

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.invalidURL){ //user tried accessing page w/o logging in/signing up
    req.session.invalidURL = false;
    res.render('signUp', {error: "You haven't logged in or signed up!"});
  }else if(req.session.username){ //already logged in, redirect straight to profile page
    res.redirect('/stargazers/' + req.session.username);
  }else if(req.session.loggedOut){
    req.session.loggedOut = false; 
    res.render('signUp', {error: "You have been logged out."});
  }else{
    res.render('signUp');
  }
});

/* Login/Signup redirect */
router.post('/', function(req, res, next){
  console.log("REQ.USER: ", req.user);
  var username = req.body.username;
  var password = req.body.password;
  var userCheck = req.body.userCheck;

  if(userCheck === "Sign Up"){ //New User; set up mongoose data
    var name = req.body.name;
    var user = new User({
      name: name,
      fb: false,
      username: username,
      password: password,
    });
    //save newly created user
    user.save(function(err, user, count){
      if(err){ res.render('error', {error: err});}
      else if(user === null){res.send("USER IS NULL."); return;}
      //create the 2 default lists for each user
      var d = new Date();
      d = d.toString();
      var nasaList = new List({
        user: user._id,
        name: "Nasa Observed",
        created: d.toString()
      });
      var userList = new List({
        user: user._id,
        name: "User Observed",
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
        console.log("User for NASA list populated");
      });
      List.findOne({_id : userID}).populate('user').exec(function(err, list){
        if(err){ res.render('error', {error: err});}
        console.log("User for User list populated");
      });


      //now reverse - save the 2 lists in the array of lists in the user schema
      user.lists.push(nasaList);
      user.lists.push(userList);
      user.save(function(err, user, count){
        if(err){ res.render('error', {error: err});}
      });
      req.session.username = username;
      res.redirect('/stargazers/' + username);
    });
  }else{ //Old user that clicked 'Login' button; redirect to new form
    res.redirect('/login');
  }
});

/*Old user login*/
router.get('/login', function(req, res, next){
  //redirected back here if the login is incorrect
  if(req.session.failure){
    req.session.failure = false;
    res.render('login', {title: "Stargazer's Collection", error:req.flash('error')});
  }else{
    res.render('login', {title: "Stargazer's Collection"});
  }
});


/* Old user login submission, implement a local strategy from Passport since they don't want to sign in with Facebook */
router.post('/login', passport.authenticate('local',{ successRedirect: '/success', failureRedirect: '/failure',  failureFlash: true}));



// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/facebookLogin' ,
                                      failureRedirect: '/failure' }));

/*Used to redirect to user's profile page after successful login/signup*/
router.get('/facebookLogin', function(req, res, next){
  //from passport.deserializeUser, we have the username stored in req.user
  //so just redirect to their profile page, since now we have access to req obj
  req.session.username = req.user.username;
  console.log("Session username: " + req.user.username);
  res.redirect('/stargazers/' + req.user.username);
});


/*Default failure redirect for both local and Facebook strategy. Sets the session variable to render the correct template on the homepage and let the user try to login again */
router.get('/failure', function(req, res, next){
  req.session.failure = true;
  res.redirect('/login');
});

router.get('/success', function(req, res, next){
  console.log("Authenticated!");
  req.session.username = req.user.username;
  res.redirect('/stargazers/' + req.user.username);
});


/* Profile Page */
router.get('/stargazers/:username', function(req, res, next){
  //get user's full name and their Lists via mongoose

  var username = req.params.username;
  //they haven't signed in!! they can't do that!
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  User.findOne({username:username}, function(err, user){
    if(err !== null || user === null){ res.send(err);}
    var header = "Hello, " + user.name + ".";
    var id = user._id;

    //find all lists associated with user id
    List.find({user: id}, function(err, lists, count){
      var listObject = {};

      //parse lists to display names and links nicely in hbs
      for(var i = 0; i < lists.length; i++){
        listObject[i] = {
          link: user.username + "/" + lists[i].name.replace(/ +/g, ""),
          name: lists[i].name
        };
      }
      res.render('profile', {header:header, lists:listObject, username:username});

    });//List find
  });//User findOne
}); //router.get


module.exports = router;
