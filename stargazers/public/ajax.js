document.addEventListener('DOMContentLoaded', init);

function init(){
  console.log('init');
  filter();
}
function filter(){
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

    var url = "/stargazers/" + username + "/" + listName + "/ajax/query?";
    for(var i = 0; i < queries.length; i+=2){
      var queryKey = queries[i];
      var queryValue= queries[i+1];
      if(queryValue === "") continue;
      url+= queryKey + '=' + queryValue;
    }

    console.log('url is: ' + url);

    //make background request
    var req = new XMLHttpRequest();
    req.open('GET', url, true);

    req.addEventListener('load', function(){
      if (req.status >= 200 && req.status < 400) {
        //parse JSON and replace table elements
        var planets = JSON.parse(req.responseText).planets;
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

          var OrbitSemiMajorAxis = document.createElement('td');
          var OrbitSemiMajorAxisText = document.createTextNode(planet.OrbitSemiMajorAxis);
          OrbitSemiMajorAxis.appendChild(OrbitSemiMajorAxisText);

          var Eccentricity = document.createElement('td');
          var EccentricityText = document.createTextNode(planet.Eccentricity);
          Eccentricity.appendChild(EccentricityText);

          var Inclination = document.createElement('td');
          var InclinationText = document.createTextNode(planet.Inclination);
          Inclination.appendChild(InclinationText);

          var MassWRTJupiter = document.createElement('td');
          var MassWRTJupiterText = document.createTextNode(planet.MassWRTJupiter);
          MassWRTJupiter.appendChild(MassWRTJupiterText);

          var Density = document.createElement('td');
          var DensityText = document.createTextNode(planet.Density);
          Density.appendChild(DensityText);

          var TVVFlag = document.createElement('td');
          var TVVFlagText = document.createTextNode(planet.TVVFlag);
          TVVFlag.appendChild(TVVFlagText);

          var KeplerFieldFlag = document.createElement('td');
          var KeplerFieldFlagText = document.createTextNode(planet.KeplerFieldFlag);
          KeplerFieldFlag.appendChild(KeplerFieldFlagText);

          var K2MissionFlag = document.createElement('td');
          var K2MissionFlagText = document.createTextNode(planet.K2MissionFlag);
          K2MissionFlag.appendChild(K2MissionFlagText);

          var NumberofNotes = document.createElement('td');
          var NumberofNotesText = document.createTextNode(planet.NumberofNotes);
          NumberofNotes.appendChild(NumberofNotesText);

          var RAStr = document.createElement('td');
          var RAStrText = document.createTextNode(planet.RAStr);
          RAStr.appendChild(RAStrText);

          var RA = document.createElement('td');
          var RAText = document.createTextNode(planet.RA);
          RA.appendChild(RAText);

          var DecStr = document.createElement('td');
          var DecStrText = document.createTextNode(planet.DecStr);
          DecStr.appendChild(DecStrText);

          var Dec = document.createElement('td');
          var DecText = document.createTextNode(planet.Dec);
          Dec.appendChild(DecText);

          var Distance = document.createElement('td');
          var DistanceText = document.createTextNode(planet.Distance);
          Distance.appendChild(DistanceText);

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

          var Updated = document.createElement('td');
          var UpdatedText = document.createTextNode(planet.Updated);
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

      //empty out current table and replace with new movies
      for(var i = 0; i < table.children.length; i++){
        var row = table.children[i];
        row.innerHTML = "";
      }
      //append all new rows to table
      for(var i = 0; i < filtered.length; i++){
        table.appendChild(filtered[i]);
      }
    }//end req.status if

  });//end load evt listener

    req.addEventListener('error', function(e){
      document.body.appendChild(document.createTextNode('uh-oh, something went wrong ' + e));
    }); //end error
    req.send();
  });//end search btn evt listener
}
