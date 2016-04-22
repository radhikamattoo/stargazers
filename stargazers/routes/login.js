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
  if(req.session.newUser === undefined){ req.session.newUser = true;}
  res.render('login', {title: "Stargazer's Collection", newUser : req.session.newUser});
});

/* Login/Signup redirect */
router.post('/', function(req, res, next){
  var username = req.body.username;
  var password = req.body.password;
  var userCheck = req.body.userCheck;

  if(userCheck === "Sign Up"){ //New User; set up mongoose data
    var name = req.body.name;
    var user = new User({
      name: name,
      username: username,
      password: password,
    });

    //save newly created user
    user.save(function(err, user, count){
      if(err){ res.render('error', {error: err});}

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
      res.redirect('/' + username);
    });
  }else{ //Old user that clicked 'Login' button; redirect to new form
    req.session.newUser = false;
    res.redirect('/');
  }
});

/* Old user login submission */
router.post('/login', passport.authenticate('local'),
    function(req, res) {
          console.log("Authenticated!");
          res.redirect('/' + req.user.username);
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/NICE',
                                      failureRedirect: '/' }));

/* Profile Page */
router.get('/:username', function(req, res, next){
  //get user's full name and their Lists via mongoose

  var username = req.params.username;
  res.render('profile', {username:username});

  //
  // User.findOne({username:username}, function(err, user, count){
  //   if(err === null || user === null){ res.send(err);}
  //   var header = "Hello, " + user.name + "!";
  //   var listIds = user.lists; //just object id's! remember to query for them
  //   var lists = [{ planets: [],
  //       __v: 0,
  //       created: 'Sun Apr 10 2016 22:14:59 GMT-0400 (EDT)',
  //       name: 'Nasa Observed',
  //       user: '570b08a3ce918660354269bb',
  //       _id: '570b08a3ce918660354269bc' },
  //       { planets: [],
  //       __v: 0,
  //       created: 'Sun Apr 10 2016 22:14:59 GMT-0400 (EDT)',
  //       name: 'User Observed',
  //       user: '570b08a3ce918660354269bb',
  //       _id: '570b08a3ce918660354269bd' }];
  //   console.log(lists);
  //   res.render('profile', {header:header, lists:lists, username:username});
  // });//user findOne
});


module.exports = router;
