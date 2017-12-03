// set variables for environment
var request = require('request')
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var moment = require('moment');
var postgres = require('./postgres_client.js');
var jwt = require('jsonwebtoken');

// Set server port
var port = process.env.PORT || 3001;

var cobaltKey = 'yOm6EunUkWMKPJw2NBCYtbclohWSkHqp'

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
console.log('server is running');

app.use(express.static(__dirname + '/'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/'));
//Store all JS and CSS in Scripts folder.

// instruct express to server up static assets
app.use(express.static('public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res) {//this block defines what our server will do when it receives a request at the url: team188.com/
    res.sendFile('./index.html');
    // TODO for some reason this can't be changed
});

app.get('/somepath', function(req, res){
    postgres.getSomething("somearguemnt", res);
});


app.get('/courses/filter', function(req, res){
  console.log(req.url);
  request.get({
      url: "https://cobalt.qas.im/api/1.0" + req.url + "&key=" + cobaltKey,
  }, function(err, resp){
    if (err){
      console.log(err);
    }
    res.send(resp.body);
    console.log(resp.body);
  });

});
