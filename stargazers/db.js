var mongoose = require('mongoose');


//define schemas
var Exoplanet = new mongoose.Schema({
  HostName: {type:String},
  PlanetLetter: {type:String, required: true},
  Discovery: {type:String},
  NumPlanetsInSystem: {type:Number, required:true},
  OrbitalPeriod: {type:Number, required:true},
  OrbitSemiMajorAxis: {type:Number},
  Eccentricity: {type:Number},
  Inclination: {type:Number},
  MassWRTJupiter: {type:Number},
  MassWRTProvenance: {type:Number},
  Density: {type:Number},
  TVVFlag: {type:Number},
  KeplerFieldFlag : {type:Number},
  K2MissionFlag: {type:Number},
  NumberOfNotes: {type:Number},
  RAStr: {type:String},
  RA: {type:Number},
  DecStr: {type:String},
  Dec: {type:Number},
  Distance: {type:Number, required:true},
  OpticalMagnitude: {type:Number},
  OpticalMagnitudeBand : {type:String},
  TemperatureK : {type:Number, required:true},
  StellarMass: {type:Number, required:true},
  StellarRadius: {type:Number, required:true},
  LasUpdate: {type:Date}
});

var List = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  created: {type: Date, required: true},
  planets: [Exoplanet]
});

var User = new mongoose.Schema({
  name: {type:String, required:true},
  username: {type:String, required:true},
  password: {type:String, required:true},
  lists: [{type: mongoose.Schema.Types.ObjectId, ref: 'List'}]
});

//register schema as model
mongoose.model("Exoplanet", Exoplanet);
mongoose.model("List", List);
mongoose.model("User", User);


//connect to db
mongoose.connect('mongodb://localhost/stars');
