var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.newUser === undefined){ req.session.newUser = true;}
  res.render('login', {title: "Stargazer's Collection", newUser : req.session.newUser});
});

//TODO: Insert Facebook Passport authentication middleware

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

    user.save(function(err, user, count){
      if(err){ res.render('error', {error: err});}
      var d = new Date();
      var nasaList = new List({
        user: user._id,
        name: "Nasa Observed",
        created: d.toString()
      });
      var userList = new List({
        user: user._id,
        name: "User Observed",
        created: d.toString()
      });

      nasaList.save(function(err, list, count){
        if(err){ res.render('error', {error: err});}
        console.log("NASA list saved");
      });
      userList.save(function(err, list, count){
        if(err){ res.render('error', {error: err});}
        console.log("User list saved");
      });

      var nasaID = nasaList._id;
      var userID = userList._id;

      //populate list objects
      List.findOne({_id : nasaID}).populate('user').exec(function(err, list){
        if(err){ res.render('error', {error: err});}
        console.log("User for NASA list populated");
      });
      List.findOne({_id : userID}).populate('user').exec(function(err, list){
        if(err){ res.render('error', {error: err});}
        console.log("User for User list populated");
      });
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

/* Old user login */
router.post('/login', function(req, res, next){
  //USER AUTHENTICATION HERE
  res.redirect('/' + req.body.username);
});

/* Profile Page */
router.get('/:username', function(req, res, next){
  //get user's full name and their Lists via mongoose
  res.send('user profile ');


});
/* NASA Archive List */
router.get('/archive', function(req, res, next){
  //set up table of NASA Exoplanets and GET form for filtering exoplanets
  //option to add exoplanet to a specified list?
  res.send('nasa archive');

});

/* Specified User List */
router.get('/:username/:listName', function(req, res, next){
  res.send('user list');

});
/* Edit mode for user list */
router.get('/:username/:listName/edit', function(req, res, next){
  //TODO: separate router handlers for delete, add, edit exoplanet?
  res.send('edit list');

});

router.get('/:username/addList', function(req, res, next){
  res.send('addlist');
});


module.exports = router;
