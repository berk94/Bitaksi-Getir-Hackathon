"use strict";

const express = require('express');
const MongoClient = require('mongodb').MongoClient; // using Mongo as the database
const bodyParser = require('body-parser'); // for handling json

const app = express();
const DEFAULT_PORT=3000;
const db = require('./config/db');

// Use bodyParser to parse requests in different formats
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// To solve the "Can't set headers after they are sent problem"
app.use(function(req,res,next){
    var _send = res.send;
    var sent = false;
    res.send = function(data){
        if(sent) return;
        _send.bind(res)(data);
        sent = true;
    };
    next();
});

MongoClient.connect(db.url, (err, client) => {
  if (err) {
    return console.log(err);
  } // problem when connecting to the client

  require('./app/routes')(app, client);

  var PORT = process.env.PORT || DEFAULT_PORT
  app.listen(PORT, () => {
    console.log("Listening to port " + PORT + "...");
  });

})
