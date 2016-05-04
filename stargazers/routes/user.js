var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');
var ObjectId = require('mongodb').ObjectID;


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
router.get('/stargazers/:username/:listName/', function(req, res, next){
  var newPlanet = req.session.newPlanet;
  if(newPlanet){
    req.session.newPlanet = false;
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
            if(list.name.replace(/ +/g, "") === listName){
              res.render('showList', {name: list.name, list:list.planets, ownList:true, username: username, linkName: list.name.replace(/ +/g, ""), newPlanet: newPlanet});
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
  res.render('addExoplanet', {name: listName.replace(/([A-Z])/g, ' $1')});
});

/* Render the list with the new planet added */
router.post('/stargazers/:username/:listName/add', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
  var date = new Date();

  //get all form elements
  var HostName = req.body.HostName;
  var PlanetLetter = req.body.PlanetLetter;
  var Discovery = req.body.Discovery;
  var NumPlanetsInSystem = req.body.NumPlanetsInSystem;
  var OrbitalPeriod = req.body.OrbitalPeriod;
  var OrbitSemiMajorAxis = req.body.OrbitSemiMajorAxis;
  var Eccentricity = req.body.Eccentricity;
  var Inclination = req.body.Inclination;
  var MassWRTJupiter = req.body.MassWRTJupiter;
  var Density = req.body.Density;
  var TVVFlag = req.body.TVVFlag;
  var KeplerFieldFlag = req.body.KeplerFieldFlag;
  var K2MissionFlag = req.body.K2MissionFlag;
  var NumberOfNotes = req.body.NumberOfNotes;
  var RAStr = req.body.RAStr;
  var RA = req.body.RA;
  var DecStr = req.body.DecStr;
  var Dec = req.body.Dec;
  var Distance = req.body.Distance;
  var OpticalMagnitude = req.body.OpticalMagnitude;
  var OpticalMagnitudeBand = req.body.OpticalMagnitudeBand;
  var TemperatureK = req.body.TemperatureK;
  var StellarMass = req.body.StellarMass;
  var StellarRadius = req.body.StellarRadius;
  var Updated = date.toString();



  //here we would check if it's in the NASA list, or a planet in our system. If it is, and this list is not
  //the NASA observed, add to NASA observed and redirect to NASA Observed page with
  //message that it matched a NASA exoplanet

  var exoplanet = new Exoplanet({
    HostName: HostName,
    PlanetLetter: PlanetLetter,
    Discovery: Discovery,
    NumPlanetsInSystem: NumPlanetsInSystem,
    OrbitalPeriod: OrbitalPeriod,
    OrbitSemiMajorAxis: OrbitSemiMajorAxis,
    Eccentricity: Eccentricity,
    Inclination: Inclination,
    MassWRTJupiter: MassWRTJupiter,
    Density: Density,
    TVVFlag: TVVFlag,
    KeplerFieldFlag: KeplerFieldFlag,
    K2MissionFlag: K2MissionFlag,
    NumberOfNotes: NumberOfNotes,
    RAStr: RAStr,
    RA: RA,
    DecStr: DecStr,
    Dec: Dec,
    Distance: Distance,
    OpticalMagnitude: OpticalMagnitude,
    OpticalMagnitudeBand: OpticalMagnitudeBand,
    TemperatureK: TemperatureK,
    StellarMass: StellarMass,
    StellarRadius: StellarRadius,
    Updated: Updated,
    NASA: false
  });

  exoplanet.save(function(err, planet){
    if(err){ res.render('error', {error: err});}
    User.findOne({username:username}, function(err, user){
      if(err !== null){ res.send(err);}
      if(user === null){res.send("User is null.");}
      var id = user._id;

      console.log("Querying by id: " + id + "\n\n\n");
      //add back space if camelcased
      var queryName = listName.replace(/([A-Z])/g, ' $1').trim();

      List.find({user: ObjectId(id)}, function(err, lists){
          if(!lists){res.send('list is null');}

          var list = null;

          for(var i = 0; i < lists.length; i++){
           list = lists[i];
            if(list.name === queryName.trim()){
              list.planets.push(exoplanet);
              list.markModified(list.planets);
              break;
            }
          }
          if(list){
            list.save(function(err){
              req.session.newPlanet = true;
              res.redirect('/stargazers/' + username + "/" + listName);
            });
          }else{
            res.send("List is null idk tbh");
          }


      });

    });
  });



});

/*Render page but make each planet checkable for editing*/
router.get('/stargazers/:username/:listName/selectExoplanets', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  // //get the id of the user to find the list they want!
  // User.findOne({username:username}, function(err, user, count){
  //   // console.log(user , " for username: ", username);
  //     if(err !== null){ res.render('error', {error: err}); return;}
  //     else if(user === null){res.send("USER IS NULL."); return;}
  //     else{
  //        var id = user._id;
  //       //find all lists associated with that ID
  //       List.find({user:id}, function(err, lists, count){
  //         if(err !== null ){ res.send(err);}
  //         for(var i = 0; i < lists.length; i++){
  //           var list = lists[i];
  //
  //           //render the matching name
  //           if(list.name.replace(/ +/g, "") === listName){
  //             res.render('selectExoplanets',{name: list.name, list:list.planets, ownList:true, username: username});
  //           }
  //         }
  //       });
  //     }
  // });
  res.render('selectExoplanets'/*,{name: list.name, list:list.planets, ownList:true, username: username}*/);


});
/*Edit or Delete checked planets, based on button pressed */
router.post('/stargazers/:username/:listName/selectExoplanets', function(req, res, next){
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

router.post('/stargazers/:username/newList', function(req, res, next){
  //add this list and its exoplanets to the user object
});


module.exports = router;
