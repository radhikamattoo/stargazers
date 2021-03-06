/* Radhika Mattoo
   Applied Internet Tech Spring 2016
   Final Project: Stargazers
   This file is routers for logging in/signing up
*/

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
LocalStrategy = require('passport-local').Strategy;
var ObjectId = require('mongodb').ObjectID;

//-------------------------(GET)HOME PAGE (SIGN UP)----------------------------//
router.get('/', function(req, res, next) {
  if(req.session.invalidURL){ //user tried accessing page w/o logging in/signing up
    req.session.invalidURL = false;
    res.render('signUp', {error: "You haven't logged in or signed up!"});
  }else if(req.session.username){ //already logged in, redirect straight to profile page
    res.redirect('/stargazers/' + req.session.username);
  }else if(req.session.loggedOut){ //clicked the logout button on profile page
    req.session.loggedOut = false;
    res.render('signUp', {error: "You have been logged out."});
  }else if(req.session.usernameTaken){ //tried signing up with taken username
    req.session.usernameTaken = false;
    res.render('signUp', {error: "That username is taken. Please try another."});
  }else{
    res.render('signUp');
  }
});

//-------------------------(POST) HOME PAGE -------------------------------//
router.post('/', function(req, res, next){
  var userCheck = req.body.userCheck;
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;

  //can safely construct new User object thanks to validate.js
  var user = new User({
    name: name,
    fb: false,
    username: username,
    password: password,
  });

  //check that username isn't taken, then save user
  User.findOne({username:username}, function(err, foundUser){
    if(foundUser){ //username taken!
      req.session.usernameTaken = true;
      res.redirect('/');
    }else{
      //save newly created user
      user.save(function(err, user, count){
        req.session.userID = user._id;
        if(err){ res.render('error', {error: err});}
        else if(user === null){res.send("USER IS NULL."); return;}

        //create the 2 default lists for each user
        var d = new Date();
        d = d.toString();
        var nasaList = new List({
          user: user._id,
          name: "nasaObserved",
          created: d
        });
        var userList = new List({
          user: user._id,
          name: "userObserved",
          created: d
        });

        //save to lists collection
        nasaList.save(function(err, list, count){
          if(err){ res.render('error', {error: err});}
          console.log("User for NASA list populated with id: " + list.user);
        });
        userList.save(function(err, list, count){
          if(err){ res.render('error', {error: err});}
          console.log("User for NASA list populated with id: " + list.user);
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
          req.session.username = username;
          res.redirect('/stargazers/' + username);
        });

      }); //end user save
    }//end else (username isn't taken)
  }); //end user find One
}); //end router POST

//-------------------------(GET) LOGIN----------------------------//
router.get('/login', function(req, res, next){
  //redirected back here if the login is incorrect
  if(req.session.failure){
    req.session.failure = false;
    res.render('login', {title: "Stargazer's Collection", error:req.flash('error')});
  }else{
    res.render('login', {title: "Stargazer's Collection"});
  }
});

//-------------------------FACEBOOK LOGIN/SIGNUP ROUTERS----------------------------//

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
  req.session.userID = req.user._id;
  console.log("RETURN OBJ: " + req.user);
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
  req.session.userID = req.user._id;
  console.log("User id: " + req.session.userID);
  res.redirect('/stargazers/' + req.user.username);
});
//----------------------------------------------------------------------------//


//-------------------------(GET) PROFILE ----------------------------//
router.get('/stargazers/:username', function(req, res, next){
  //get user's full name and their Lists via mongoose

  var username = req.params.username;
  console.log(req.session.userID + "    " +  req.session.username);
  //they haven't signed in!! they can't do that!
  if(req.session.userID === undefined || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }else{
    User.findOne({_id:ObjectId(req.session.userID)}, function(err, user){

      //construct 'hello' message for profile
      var displayName = user.name.charAt(0).toUpperCase() + user.name.slice(1);
      var header = "Hello, " + displayName + ".";
      var id = user._id;

      //find all lists associated with user id
      List.find({user: id}, function(err, lists, count){
        var listObject = {};

        //parse lists to display names and links nicely in hbs
        for(var i = 0; i < lists.length; i++){
          var humanReadableListName = lists[i].name //uncamel case list names
          // insert a space between lower & upper
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          // space before last upper in a sequence followed by lower
          .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
          // uppercase the first character
          .replace(/^./, function(str){ return str.toUpperCase(); });

          listObject[i] = {
            link: '/stargazers/'+ username + "/" + lists[i].name, //camel cased
            name: humanReadableListName //uncamelcased
          };
        }

        res.render('profile', {header:header, lists:listObject, username:username});

      });//List find
    });//User findOne
  }//end else
}); //router.get


module.exports = router;
