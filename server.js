// server.js

// BASE SETUP
// =============================================================================

var mongoose   = require('mongoose');
var mongodbUrl = process.env.MONGODBURL;

mongoose.connect(mongodbUrl, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

var Location     = require('./app/models/location');

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var https      = require('https');
var fs         = require('fs');
var bodyParser = require('body-parser');
var moment     = require('moment');


var options = {
  ca: fs.readFileSync("ssl/server.csr"),
  cert: fs.readFileSync("ssl/server.crt"),
  key: fs.readFileSync("ssl/server.key")
};

var server = https.createServer(options, app);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3333;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log(req.body);
    console.log('Something is happening.');

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
     // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooraye! welcome to our api!' });
});

// more routes for our API will happen here

router.route('/findUsers')

    .get(function(req,res) {
        sw_lng = parseFloat(req.query.sw_lng);
        sw_lat = parseFloat(req.query.sw_lat);
        ne_lng = parseFloat(req.query.ne_lng);
        ne_lat = parseFloat(req.query.ne_lat);

           /*
        Location.find({
          loc: {
           $geoWithin: {
              $box: [
                [ sw_lng, sw_lat ],
                [ ne_lng, ne_lat ]
              ]

           }
         }
        }, function(err, bears) {
            if (err)
                res.send(err);

            res.json(bears);
        });
        */

        var time_limit = moment().subtract(5, 'days');

        Location.aggregate([
          {
            $match: {
              date: {"$gte": time_limit.toDate()}
            }
          },
          {
            $group: {
              _id: "$user",
              username: {$last: "$username"},
              loc: {$last: "$loc"},
              date: {$last: "$date"},
              activity: {$last: "$activity"},
              fbuser: {$last: "$fbuser"}
            }
          },
          {
            $match: {
              loc: {
                 $geoWithin: {
                    $box: [
                      [ sw_lng, sw_lat ],
                      [ ne_lng, ne_lat ]
                    ]

                 }
               }
            }
          }


        ], function(err, bears) {
            if (err)
                res.send(err);

            res.json(bears);
        });

    });

router.route('/locations')

// create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {
        var location = new Location();      // create a new instance of the Bear model
        location.user = req.body.user;  // set the bears name (comes from the request)
        location.username = req.body.username;
        location.loc = req.body.loc;
        location.date = req.body.date;
        location.activity = req.body.activity;
        location.fbuser = req.body.fbuser;

        // save the bear and check for errors
        location.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'location created!' });
        });

    })
    ;


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

//server.listen(port, function(){
//      console.log('Magic happens on port ' + port);
//});
