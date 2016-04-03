var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send("Welcome to Stargazer's!");
});


app.listen(3000);
