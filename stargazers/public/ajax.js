document.addEventListener('DOMContentLoaded', init);

function init(){
  //create error message element and hide it
  var info = document.getElementById("queryError");
  var message = document.createElement('p');
  var messageText = document.createTextNode("Hmmm we didn't find anything for that query. Try something else!");
  message.appendChild(messageText);
  message.classList.add('error');
  message.classList.add('hideMessage');
  console.log("Message class list: " + message.classList);
  info.appendChild(message);
  filter(message);
}
function filter(message){
  //add event listener to filter button on list display page
  document.getElementById("search").addEventListener('click', function(evt){
    //dont submit form
    evt.preventDefault();

    var HostName = document.getElementById('hostname').value;
    var PlanetLetter = document.getElementById('planetletter').value;
    var Temperature = document.getElementById('temperature').value;
    var username = document.getElementById('username').value;
    var listName = document.getElementById('listName').value;

    var queries = ['hostname', HostName, 'planetLetter',PlanetLetter, 'temperature',Temperature];

    var url = "/stargazers/" + username + "/";
    if(listName === 'nasa'){
      url += 'nasa/archive/ajax/query?';
    }else{
      url += listName + "/ajax/query?";
    }

    for(var i = 0; i < queries.length; i+=2){
      var queryKey = queries[i];
      var queryValue= queries[i+1];
      if(queryValue === "") continue;
      url+= queryKey + '=' + queryValue + '&';
    }
    url = url.slice(0,-1); //remove extraneous &

    console.log('url is: ' + url);

    //make background request
    var req = new XMLHttpRequest();
    req.open('GET', url, true);

    req.addEventListener('load', function(){
      if (req.status >= 200 && req.status < 400) {
        //parse JSON and replace table elements
        var planets = JSON.parse(req.responseText).planets;
        console.log("PLANETS: " + typeof(planets));
        if(Object.keys(planets).length !== 0){
          var table = document.getElementById("planet-list");

          //construct array to hold filtered exoplanet objects
          var filtered = [];
          for(var i = 0; i < planets.length; i++){
            //create new table row and table data for all parts of exoplanet
            var planet = planets[i]; //get movie object for data
            var row = document.createElement('tr');

            //create tabledata elements to go into tablerow
            var HostName = document.createElement('td');
            var HostNameText = document.createTextNode(planet.HostName);
            HostName.appendChild(HostNameText);

            var PlanetLetter = document.createElement('td');
            var PlanetLetterText = document.createTextNode(planet.PlanetLetter);
            PlanetLetter.appendChild(PlanetLetterText);

            var Discovery = document.createElement('td');
            var DiscoveryText = document.createTextNode(planet.Discovery);
            Discovery.appendChild(DiscoveryText);

            var NumPlanetsInSystem = document.createElement('td');
            var NumPlanetsInSystemText = document.createTextNode(planet.NumPlanetsInSystem);
            NumPlanetsInSystem.appendChild(NumPlanetsInSystemText);

            var OrbitalPeriod = document.createElement('td');
            var OrbitalPeriodText = document.createTextNode(planet.OrbitalPeriod);
            OrbitalPeriod.appendChild(OrbitalPeriodText);

            if(Number(planet.OrbitSemiMajorAxis) === 0|| planet.OrbitSemiMajorAxis === undefined ){
              planet.OrbitSemiMajorAxis = "";
            }
            var OrbitSemiMajorAxis = document.createElement('td');
            var OrbitSemiMajorAxisText = document.createTextNode(planet.OrbitSemiMajorAxis);
            OrbitSemiMajorAxis.appendChild(OrbitSemiMajorAxisText);

            if(Number(planet.Eccentricity) === 0|| planet.Eccentricity === undefined ){
              planet.Eccentricity = "";
            }
            var Eccentricity = document.createElement('td');
            var EccentricityText = document.createTextNode(planet.Eccentricity);
            Eccentricity.appendChild(EccentricityText);


            if(Number(planet.Inclination) === 0|| planet.Inclination === undefined ){
              planet.Inclination = "";
            }
            var Inclination = document.createElement('td');
            var InclinationText = document.createTextNode(planet.Inclination);
            Inclination.appendChild(InclinationText);

            if(Number(planet.MassWRTJupiter) === 0|| planet.MassWRTJupiter === undefined ){
              planet.MassWRTJupiter = "";
            }
            var MassWRTJupiter = document.createElement('td');
            var MassWRTJupiterText = document.createTextNode(planet.MassWRTJupiter);
            MassWRTJupiter.appendChild(MassWRTJupiterText);

            if(Number(planet.Density) === 0|| planet.Density === undefined ){
              planet.Density = "";
            }
            var Density = document.createElement('td');
            var DensityText = document.createTextNode(planet.Density);
            Density.appendChild(DensityText);


            if(Number(planet.TVVFlag) === 0|| planet.TVVFlag === undefined ){
              planet.TVVFlag = "";
            }
            var TVVFlag = document.createElement('td');
            var TVVFlagText = document.createTextNode(planet.TVVFlag);
            TVVFlag.appendChild(TVVFlagText);

            if(Number(planet.KeplerFieldFlag) === 0 || planet.KeplerFieldFlag === undefined ){
              planet.KeplerFieldFlag = "";
            }
            var KeplerFieldFlag = document.createElement('td');
            var KeplerFieldFlagText = document.createTextNode(planet.KeplerFieldFlag);
            KeplerFieldFlag.appendChild(KeplerFieldFlagText);

            if(Number(planet.K2MissionFlag) === 0 || planet.K2MissionFlag === undefined){
              planet.K2MissionFlag = "";
            }
            var K2MissionFlag = document.createElement('td');
            var K2MissionFlagText = document.createTextNode(planet.K2MissionFlag);
            K2MissionFlag.appendChild(K2MissionFlagText);

            if(Number(planet.NumberOfNotes) === 0 || planet.NumberOfNotes === undefined){
              planet.NumberOfNotes = "";
            }
            var NumberofNotes = document.createElement('td');
            var NumberofNotesText = document.createTextNode(planet.NumberOfNotes);
            NumberofNotes.appendChild(NumberofNotesText);

            var RAStr = document.createElement('td');
            var RAStrText = document.createTextNode(planet.RAStr);
            RAStr.appendChild(RAStrText);

            if(Number(planet.RA) === 0|| planet.RA === undefined){
              planet.RA = "";
            }
            var RA = document.createElement('td');
            var RAText = document.createTextNode(planet.RA);
            RA.appendChild(RAText);

            var DecStr = document.createElement('td');
            var DecStrText = document.createTextNode(planet.DecStr);
            DecStr.appendChild(DecStrText);

            if(Number(planet.Dec) === 0|| planet.Dec === undefined){
              planet.Dec = "";
            }
            var Dec = document.createElement('td');
            var DecText = document.createTextNode(planet.Dec);
            Dec.appendChild(DecText);

            var Distance = document.createElement('td');
            var DistanceText = document.createTextNode(planet.Distance);
            Distance.appendChild(DistanceText);

            if(Number(planet.OpticalMagnitude) === 0|| planet.OpticalMagnitude === undefined){
              planet.OpticalMagnitude = "";
            }
            var OpticalMagnitude = document.createElement('td');
            var OpticalMagnitudeText = document.createTextNode(planet.OpticalMagnitude);
            OpticalMagnitude.appendChild(OpticalMagnitudeText);

            var OpticalMagnitudeBand = document.createElement('td');
            var OpticalMagnitudeBandText = document.createTextNode(planet.OpticalMagnitudeBand);
            OpticalMagnitudeBand.appendChild(OpticalMagnitudeBandText);

            var TemperatureK = document.createElement('td');
            var TemperatureKText = document.createTextNode(planet.TemperatureK);
            TemperatureK.appendChild(TemperatureKText);

            var StellarMass = document.createElement('td');
            var StellarMassText = document.createTextNode(planet.StellarMass);
            StellarMass.appendChild(StellarMassText);

            var StellarRadius = document.createElement('td');
            var StellarRadiusText = document.createTextNode(planet.StellarRadius);
            StellarRadius.appendChild(StellarRadiusText);

            //have to restringify lol
            var Updated = document.createElement('td');
            var UpdatedText = document.createTextNode(new Date(parseInt(planet.Updated.substr(6))).toString());
            Updated.appendChild(UpdatedText);

            row.appendChild(HostName);
            row.appendChild(PlanetLetter);
            row.appendChild(Discovery);
            row.appendChild(NumPlanetsInSystem);
            row.appendChild(OrbitalPeriod);
            row.appendChild(OrbitSemiMajorAxis);
            row.appendChild(Eccentricity);
            row.appendChild(Inclination);
            row.appendChild(MassWRTJupiter);
            row.appendChild(Density);
            row.appendChild(TVVFlag);
            row.appendChild(KeplerFieldFlag);
            row.appendChild(K2MissionFlag);
            row.appendChild(NumberofNotes);
            row.appendChild(RAStr);
            row.appendChild(RA);
            row.appendChild(DecStr);
            row.appendChild(Dec);
            row.appendChild(Distance);
            row.appendChild(OpticalMagnitude);
            row.appendChild(OpticalMagnitudeBand);
            row.appendChild(TemperatureK);
            row.appendChild(StellarMass);
            row.appendChild(StellarRadius);
            row.appendChild(Updated);
            filtered.push(row); //add row to array

          }//end for loop
        }else{
          message.classList.remove('hideMessage');
        }

        if(Object.keys(planets).length !== 0){//only empty table if there's a query result
          message.classList.add('hideMessage');
          console.log(  document.getElementById("queryError").classList);
          //empty out current table and replace with new movies
          for(var i = 0; i < table.children.length; i++){
            var row = table.children[i];
            row.innerHTML = "";
          }
          //append all new rows to table
          for(var i = 0; i < filtered.length; i++){
            table.appendChild(filtered[i]);
          }
        }
    }//end req.status if

  });//end load evt listener

    req.addEventListener('error', function(e){
      document.body.appendChild(document.createTextNode('uh-oh, something went wrong ' + e));
    }); //end error
    req.send();
  });//end search btn evt listener
}


//note: taken from a stack overflow answer about how to unserialize date objects
//once they're converted to JSON:
//http://stackoverflow.com/questions/4511705/how-to-parse-json-to-receive-a-date-object-in-javascript
dateTimeReviver = function (key, value) {
    var a;
    if (typeof value === 'string') {
        a = /\/Date\((\d*)\)\//.exec(value);
        if (a) {
            return new Date(+a[1]);
        }
    }
    return value;
};
