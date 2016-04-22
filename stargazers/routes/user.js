var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Exoplanet = mongoose.model('Exoplanet');
var User = mongoose.model('User');
var List = mongoose.model('List');

/* NASA Archive List */
router.get('/:username/nasa/archive', function(req, res, next){
  //set up table of NASA Exoplanets and GET form for filtering exoplanets
  //option to add exoplanet to a specified list?
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
  console.log(findObject);
  Exoplanet.find(findObject, function(err, planets, count){
    res.render('showList', {name: 'NASA Exoplanet Archive', list:planets});
  });

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

/*Create a new list  */
router.get('/:username/newList', function(req, res, next){
  res.send('addlist');
});

module.exports = router;
