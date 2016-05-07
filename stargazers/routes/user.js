/* Radhika Mattoo
   Applied Internet Tech Spring 2016
   Final Project: Stargazers
   This file is for traversing a user's profile, like:
   Getting to the user's profile
   Looking at/Querying the NASA database
   Looking at a list
   Querying a list
   Adding a new list
   Selecting exoplanets to edit
*/
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');
var ObjectId = require('mongodb').ObjectID;


//----------------------------------- LOGOUT----------------------------------//

/*User wants to log out!*/
router.get("/stargazers/:username/logout", function(req, res, next){
  req.session.username = null;
  req.session.loggedOut = true;
  res.redirect('/');
});

//----------------------------(GET) NASA Archive List----------------------------//
router.get('/stargazers/:username/nasa/archive', function(req, res, next){
  //set up table of NASA Exoplanets and GET form for filtering exoplanets
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }

  var findObject = {NASA: true};
  Exoplanet.find(findObject, function(err, planets, count){
    res.render('showList', {name: 'NASA Exoplanet Archive', list:planets, username: username});
  });

});
//------------------------------(GET) NEW LIST--------------------------------//

/*Create a new list form */
router.get('/stargazers/:username/newList', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  //render the form for adding a list
  res.render('newList');
});

//----------------------------(POST) NEW LIST---------------------------------//
router.post('/stargazers/:username/newList', function(req, res, next){
  //add this list and its exoplanets to the user object
  var username = req.params.username;
  var listName = req.params.listName;
  var name = req.body.Name;
  name = name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, ''); //camel case the input
  console.log("camel cased name:" + name);

  User.findOne({username:username}, function(err, user){
    var id = user._id;
    var list = new List({
      user: id,
      name:name,
      created: new Date().toString(),
      planets : []
    });
    list.save(function(err){
      console.log("new list has been saved" + list);
      res.redirect('/stargazers/' + username + '/');
    });
  });
});

//--------------------------------(GET) SHOW LIST----------------------------//
router.get('/stargazers/:username/:listName/', function(req, res, next){
  var message = null;
  //did they try adding to NASA list, but their planet wasn't found?
  var notNASA = req.session.notNASA;

  //did they try to add to own list, but planet matched NASA exoplanet?
  var matchedNASA = req.session.matchedNASA;

  //did they just add a new planet successfully?
  var newPlanet = req.session.newPlanet;

  //did they try adding a duplicate?
  var duplicate = req.session.duplicate;

  //did they just update a planet?
  var updated = req.session.updated;

  //did they just delete a planet?
  var deleted = req.session.deleted;

  if(notNASA){
    message = "Your planet wasn't found in the NASA database! Please try again.\n";
    req.session.notNASA = false;
  }
  else if(newPlanet){
    message = "Your planet has been successfully added! Congratulations!";
    req.session.newPlanet = false;
  }else if(matchedNASA){
    message = "Your planet matched a discovered NASA exoplanet - please check your Nasa Observed list for the new addition";
    req.session.matchedNASA = false;
  }else if(duplicate){
    message = "That's a duplicate planet! It's already in your list! (Hint: Check your NASA Observed)";
    req.session.duplicate = false;
  }else if(updated){
    message = "Your exoplanet has been successfully updated!";
    req.session.updated = false;
  }else if(deleted){
    message = "Your exoplanet has been successfully deleted!";
    req.session.deleted = false;
  }

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
            if(list.name === listName){ //mongodb name vs. params name are both camelcased, don't have to change
              var humanReadableListName = list.name //now have to uncamelcase for hbs
              // insert a space between lower & upper
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              // space before last upper in a sequence followed by lower
              .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
              // uppercase the first character
              .replace(/^./, function(str){ return str.toUpperCase(); });

              if(listName === 'nasaObserved'){
                res.render('showList', {name: humanReadableListName, list:list.planets,
                ownList:true, username: username, linkName: list.name, message: message,
                nasaObserved:true, listName: listName, showList: true});
              }else{
                res.render('showList', {name: humanReadableListName, list:list.planets,
                ownList:true,username: username, linkName: list.name, message: message,
                listName: listName, showList: true});
              }
            }
          }
        });
      }
  });
});

//---------------------(GET)SELECT PLANET TO EDIT/DELETE--------------------//
router.get('/stargazers/:username/:listName/selectExoplanets', function(req, res, next){

  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  //get the id of the user to find the list they want!
  User.findOne({username:username}, function(err, user, count){
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
            if(list.name === listName){
              var displayName = listName  // insert a space between lower & upper
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                // space before last upper in a sequence followed by lower
                .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
                // uppercase the first character
                .replace(/^./, function(str){ return str.toUpperCase(); });
              if(listName === 'nasaObserved'){
                res.render('selectExoplanets',{name: displayName,
                  list:list.planets, ownList:true, username: username, nasaObserved:true});
              }else{
                res.render('selectExoplanets',{name: displayName, list:list.planets,
                  ownList:true, username: username});
              }
            }
          }
        });
      }
  });
});
//---------------------(POST)SELECT PLANET TO EDIT/DELETE----------------------//
router.post('/stargazers/:username/:listName/selectExoplanets', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;

  var checkedPlanets = req.body.planets; //array of checked values
  console.log("Checked planet values are: " + checkedPlanets);
  var button = req.body.select;
  if(!checkedPlanets){ //FIXME PARSLEY EDITING HERE
    req.session.notChecked = "Please select at least one exoplanet";
    console.log(req.session.notChecked);
    res.redirect('/stargazers/' + username + '/ ' + listName + ' /selectExoplanets');
  }else if(button === "delete"){
    //get the user
    //delete and redirect to showlist
    var planetData = checkedPlanets.split("_");
    var PlanetLetter = planetData[0];
    var Distance = Number(planetData[1]);
    var TemperatureK = Number(planetData[2]);

    var searchObject = {
      PlanetLetter: PlanetLetter,
      Distance: Distance,
      TemperatureK: TemperatureK
    };

    Exoplanet.findOne(searchObject, function(err, planet){
      var planetID = planet._id;
      console.log("PLANET ID: " + planetID);

      User.findOne({username: username}, function(err, user){
        var id = user._id;

        List.findOne({name: listName, user: ObjectId(id)}, function(err, list){
          if(!list){res.send('list is null');}

          list.planets.id(planetID).remove();

          list.save(function(err){
            if(err){ res.send(err);}
            console.log("Subdocument was removed");
            req.session.deleted = true;
            res.redirect('/stargazers/' + username +'/' + listName +'/');
          });
        });
      });
    });
  }else if(button === "edit"){
    //create session object consisting of edited planet info and redirect
    req.session.checkedPlanets = checkedPlanets;
    console.log("CHECKED PLANET IS: " + checkedPlanets);
    res.redirect('/stargazers/' + username + '/' + listName + '/edit');
  }
});



//------------------------------AJAX QUERY LIST--------------------------------//
router.get('/stargazers/:username/:listName/ajax/query', function(req, res){
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  if(req.query.hostname === "" && req.query.planetLetter === "" && req.query.temperature === ""){
      res.redirect('/stargazers/' + username + '/' + listName);
  }
  var requestObject = {};

  if(req.query.hostname !== undefined && req.query.hostname !== ""){
    console.log('added host');
    requestObject['HostName'] = req.query.hostname;
  }
  if(req.query.planetLetter !== undefined && req.query.planetLetter !== ""){
    console.log('added planet letter');
      requestObject['PlanetLetter'] = req.query.planetLetter;
  }
  if(req.query.temperature !== undefined && req.query.temperature != ""){
    console.log('added temp');
    requestObject['TemperatureK'] = req.query.temperature;
  }

  Exoplanet.find(requestObject, function(err, planets){
    //get user, get list, query in that list for exoplanets
    User.findOne({username:username}, function(err, user){
      var id = user._id;
      List.findOne({name: listName, user: ObjectId(id)}, function(err, list){
        var exoplanets = [];
        var listLength = list.planets.length;
        var planetListLength = planets.length;
        for(var i = 0; i < list.planets.length; i++){
          var listPlanet = list.planets[i];
          for(var j = 0; j < planets.length; j++){
            var exoplanet = planets[j];
            if(listPlanet._id.toString() === exoplanet._id.toString()){
              exoplanets.push(exoplanet);
            }
          }
        }//end nested loop
        var jsonPlanets = {planets:exoplanets};
        res.json(jsonPlanets);

      });
    });
  });

});


module.exports = router;
