var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');


/*User wants to log out!*/
router.get("/stargazers/:username/logout", function(req, res, next){
  req.session.username = null;
  req.session.loggedOut = true; 
  res.redirect('/');
});


/* NASA Archive List */
router.get('/stargazers/:username/nasa/archive', function(req, res, next){
  //set up table of NASA Exoplanets and GET form for filtering exoplanets
  var username = req.params.username;
  console.log("Session username from NASA archive: " + username);
  //they haven't signed in!! they can't do that!
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  var findObject = {NASA: true};
  if(req.query.hostname !== undefined && req.query.hostname !== ''){
    findObject["HostName"] = req.query.hostname;
  }
  if(req.query.planetletter !== undefined && req.query.planetletter !== ''){
    findObject["PlanetLetter"] = req.query.planetletter.toLowerCase();
  }
  if(req.query.temperature !== undefined && req.query.temperature !== ''){
    findObject["TemperatureK"] = Number(req.query.temperature);
  }
  Exoplanet.find(findObject, function(err, planets, count){
    res.render('showList', {name: 'NASA Exoplanet Archive', list:planets, username: username});
  });

});

/* Specified User List */
router.get('/stargazers/:username/:listName', function(req, res, next){

  var listName = req.params.listName;
  var username = req.params.username;

  //make sure they've logged in
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  //get the id of the user to find the list they want!
  User.findOne({username:username}, function(err, user, count){
    // console.log(user , " for username: ", username);
      if(err !== null){ res.render('error', {error: err}); return;}
      else if(user === null){res.send("USER IS NULL."); return;}
      else{
         var id = user._id;
        //find all lists associated with that ID
        List.find({user:id}, function(err, lists, count){
          if(err !== null ){ res.send(err);}
          for(var i = 0; i < lists.length; i++){
            var list = lists[i];

            //render the matching name
            if(list.name.replace(/ +/g, "") === listName){
              res.render('showList', {name: list.name, list:list.planets, ownList:true, username: username});
            }
          }
        });
      }
  });


});

/*Render form for adding an exoplanet */
router.get('/stargazers/:username/:listName/add', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
});
/* Render the list with the new planet added */
router.post('/stargazers/:username/:listName/add', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
});

/*Render page but make each planet checkable for editing*/
router.get('/stargazers/:username/:listName/edit', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
});
/*Render another form for editing the selected planets*/
router.post('/stargazers/:username/:listName/edit', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
});

/*User has submitted their changes. Check */
router.post('');

/*Render page but with each planet checkable for deletion*/
router.get('/stargazers/:username/:listName/delete', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;

  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }

});

/*Delete checked planets and render showList*/
router.post('/stargazers/:username/:listName/delete', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;

});

/*Create a new list form */
router.get('/stargazers/:username/newList', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  //render the form for adding a list with max 3 planets in it.
});



module.exports = router;
