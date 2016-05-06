var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');
var ObjectId = require('mongodb').ObjectID;


/*Render form for adding an exoplanet */
router.get('/stargazers/:username/:listName/add', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;
  if(req.session.username !== username || req.session.username === undefined){
    req.session.invalidURL = true;
    res.redirect('/');
  }
  var displayName = listName
  // insert a space between lower & upper
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  // space before last upper in a sequence followed by lower
  .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
  // uppercase the first character
  .replace(/^./, function(str){ return str.toUpperCase(); });

  res.render('addExoplanet', {name: displayName});
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

  //they want to add to their NASA observed list
  //make sure the exoplanet object is in the NASA list
  //if not, send error
  if(listName === 'nasaObserved'){
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
      NASA: true
    });

    var searchObject = {
      NASA:true,
      PlanetLetter: PlanetLetter,
      NumPlanetsInSystem: NumPlanetsInSystem,
      OrbitalPeriod: OrbitalPeriod,
      Distance: Distance,
      TemperatureK: TemperatureK,
      StellarMass: StellarMass,
      StellarRadius: StellarRadius
    };
    Exoplanet.findOne(searchObject, function(err, planet){
      if(!planet){ //not in list! send back error
        console.log("Planet not found");
        req.session.notNASA = true;
        res.redirect('/stargazers/' + username + '/' + listName);
      }else{
        //found a NASA exoplanet matching; add it to the user's NASA list
        var planetID = planet._id.toString();
        User.findOne({username:username}, function(err, user){
          var id = user._id;
          List.findOne({user: ObjectId(id), name: listName}, function(err, list){
            //make sure we don't add a duplicate
            for(var i = 0; i < list.planets.length; i++){
              var listPlanet = list.planets[i];
              var listPlanetID = listPlanet._id.toString();
              if(listPlanetID === planetID){
                console.log('duplicate!');
                req.session.duplicate = true;
                break;
              }
            }
            if(req.session.duplicate){
              res.redirect('/stargazers/' + username + "/" + listName);
            }else{
              console.log("PUSHING PLANET: " + planet);
              list.planets.push(planet);
              list.save(function(err){
                console.log("exoplanet added");
                req.session.newPlanet = true;
                res.redirect('/stargazers/' + username + "/" + listName);
              });
            }
          });
        });
      }
    });
  }else{ //adding to user list

  //here we would check if it's in the NASA list, or a planet in our system. If it is, and this list is not
  //the NASA observed, add to NASA observed and redirect to NASA Observed page with
  //message that it matched a NASA exoplanet
  var NASACheck = {
    NASA:true,
    PlanetLetter:PlanetLetter,
    TemperatureK: TemperatureK,
    StellarMass: StellarMass,
    StellarRadius: StellarRadius};

  Exoplanet.findOne(NASACheck, function(err, planet){
      if(planet){
        var planetID = planet._id.toString();
        console.log("Matches! Add exoplanet to NASA Observed list ");
        User.findOne({username:username}, function(err, user){
          var id = user._id;
          List.findOne({user: ObjectId(id), name: 'nasaObserved'}, function(err, list){
            console.log("Adding to list" + list);
            //make sure we don't add a duplicate
            for(var i = 0; i < list.planets.length; i++){ //FIXME - ACCESS TO ID VALUE IN PLANETS
              var listPlanet = list.planets[i];
              var listPlanetID = listPlanet._id.toString();
              if(listPlanetID === planetID){
                console.log('duplicate!');
                req.session.duplicate = true;
                break;
              }
            }
            if(req.session.duplicate){
              res.redirect('/stargazers/' + username + "/" + listName);
            }else{
              list.planets.push(planet);
              list.save(function(err){
                console.log("exoplanet added");
                req.session.matchedNASA = true;
                res.redirect('/stargazers/' + username + "/" + listName);
              });
            }
          });
        });
      }else{ //not found in NASA database, make sure it's not a duplicate and save!
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

      //test if it's a duplicate planet
      NASACheck.NASA = false;
      Exoplanet.findOne(NASACheck, function(err, planet){
        if(planet){ //duplicate!
          req.session.duplicate = true;
          res.redirect('/stargazers/' + username + "/" + listName);
        }else{
          exoplanet.save(function(err, planet){
            var planetID = planet._id;
            console.log('PLANET ID: ' + planetID);
            if(err){ res.render('error', {error: err});}
            User.findOne({username:username}, function(err, user){
              var id = user._id;
              List.findOne({user: ObjectId(id), name: listName}, function(err, list){
                console.log("Adding to list" + list);
                list.planets.push(planet);
                list.save(function(err){
                  console.log("exoplanet added");
                  req.session.newPlanet = true;
                  res.redirect('/stargazers/' + username + "/" + listName);
                });//end list save
              });//end list find
            }); //end user find
          });//end exoplanet save
        }//end else
      });//end exoplanet findOne
    } //end else
  });//end exoplanet findone
  }//end else
});//end router post





/*Edit selected exoplanets (only accessible via redirect)*/
router.get('/stargazers/:username/:listName/edit', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;

  var checkedPlanets = req.session.checkedPlanets;
  console.log("In the edit router, checkedPlanets is: " + checkedPlanets);
  var planetData = checkedPlanets.split("_");
  var PlanetLetter = planetData[0];
  var Distance = Number(planetData[1]);
  var TemperatureK = Number(planetData[2]);
  var searchObject = {
    PlanetLetter: PlanetLetter,
    Distance: Distance,
    TemperatureK: TemperatureK
  };
  //find planets and render edit form with value= the values already in object
  Exoplanet.findOne(searchObject, function(err, planet){
    if(!planet){res.render("Planet found is null");}
    else{
      var sendName = listName  // insert a space between lower & upper
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // space before last upper in a sequence followed by lower
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        // uppercase the first character
        .replace(/^./, function(str){ return str.toUpperCase(); });

      res.render('editExoplanet', {planet: planet, name:sendName});
    }
  });
});

/*Submits an edit to selected exoplanet*/
router.post('/stargazers/:username/:listName/edit', function(req, res, next){
  var username = req.params.username;
  var listName = req.params.listName;

  var date = new Date();
  var _id = req.body.id;
  //get all form elements
  var updatedObject = {
     HostName : req.body.HostName,
     PlanetLetter : req.body.PlanetLetter,
     Discovery : req.body.Discovery,
     NumPlanetsInSystem : req.body.NumPlanetsInSystem,
     OrbitalPeriod : req.body.OrbitalPeriod,
     OrbitSemiMajorAxis : req.body.OrbitSemiMajorAxis,
     Eccentricity : req.body.Eccentricity,
     Inclination : req.body.Inclination,
     MassWRTJupiter :req.body.MassWRTJupiter,
     Density : req.body.Density,
     TVVFlag : req.body.TVVFlag,
     KeplerFieldFlag :req.body.KeplerFieldFlag,
     K2MissionFlag : req.body.K2MissionFlag,
     NumberOfNotes : req.body.NumberOfNotes,
     RAStr : req.body.RAStr,
     RA : req.body.RA,
     DecStr : req.body.DecStr,
     Dec : req.body.Dec,
     Distance : req.body.Distance,
     OpticalMagnitude : req.body.OpticalMagnitude,
     OpticalMagnitudeBand : req.body.OpticalMagnitudeBand,
     TemperatureK : req.body.TemperatureK,
     StellarMass : req.body.StellarMass,
     StellarRadius : req.body.StellarRadius,
     Updated : date.toString()
  };

  //find exoplanet in specified list and update it
  User.findOne({username: username}, function(err, user){
      id = user._id;
    List.findOne({name: listName, user: ObjectId(id)}, function(err, list){
      //now have list object; pull exoplanet and save it
      list.planets.forEach(function(planet){
        var planetID = planet._id.toString();
        if(planetID === _id){ //if it matches the hidden form value, replace
          list.planets.id(planetID).remove();

          //remove exoplanet from database
          var query = Exoplanet.find.remove({_id: planet._id});
          query.exec();
          console.log('removed previous exoplanet');

          var replacement = new Exoplanet(updatedObject);
          replacement.save(function(err){
            list.planets.push(replacement);
            list.save(function(err){
              if(err){ res.send(err);}
              console.log("Subdocument was edited");
              req.session.updated = true;
              res.redirect('/stargazers/' + username +'/' + listName +'/');
            });
          });
        }
      });

    });//end list findone
  });//end user findone
});




module.exports = router;