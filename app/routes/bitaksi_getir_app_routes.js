"use strict";
//
// Author: Kemal Berk Kocabagli
///
// cache the received requests to respond faster if the same request is repeated.
// least recently used is removed.
// ideally, the cache should be stored in an external db and is useful if and only if the
// responses are deterministic (the data does not change) and the same requests are sent frequently.
// if the data changes, the corresponding cached answers should be deleted as well.
const CACHE_SIZE = 2; // default cache size
var request_response_dict = {};
var time_sent_request_dict = {};

module.exports = function(app,client){
  app.post('/searchRecord', (req, res) => {
    console.log("====================");
    console.log("Request - Response dictionary before new request");
    console.log(request_response_dict);
    console.log("\n");
    console.log("New request:");
    console.log(JSON.stringify(req.body));
    console.log("\n");

    if (JSON.stringify(req.body) in request_response_dict) {
      console.log("This request was sent before! Fetching from cache...")
      var last_sent = Date.now();
      delete time_sent_request_dict[request_response_dict[JSON.stringify(req.body)]['last_sent']];
      time_sent_request_dict[last_sent] = JSON.stringify(req.body);
      request_response_dict[JSON.stringify(req.body)]['last_sent'] = last_sent
      res.send(request_response_dict[JSON.stringify(req.body)]['response']);
      res.end();
      console.log("Request - Response dictionary after new request");
      console.log(request_response_dict);
      console.log("====================\n");
      return
    }

    var errors = [];
    // check if the input is in the desired format.
    // if a parameter is not entered, it is not considered in filtering.
    // if no parameters are given, return all records in the collection.
    var match_date={createdAt:{}};
    var match_count={totalCount:{}};

    if (req.body != undefined) {
      // the record should be created at a time later than or equal to startDate and before or equal to endDate
      if (req.body.startDate != undefined) {
        if (req.body.startDate.match(/^[0-9]{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) == null){
          errors.push({'startDate': 'Format should be YYYY-MM-DD.'});
        }
        else {
          match_date['createdAt']['$gte']=new Date(req.body['startDate']);
        }
      }
      if (req.body.endDate != undefined) {
        if (req.body.endDate.match(/^[0-9]{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/) == null){
          errors.push({'endDate': 'Format should be YYYY-MM-DD.'});
        }
        else {
          match_date['createdAt']['$lte']=new Date(req.body['endDate']);
        }
      }
      // the record should have a totalCount greater than or equal to minCount and less than or equal to maxCount
      if (req.body.minCount != undefined) {
        if (typeof(req.body.minCount)!='number'){
          errors.push({'minCount': 'Type should be a number.'});
        }
        else {
          match_count['totalCount']['$gte']= parseInt(req.body['minCount']);
        }
      }
      if (req.body.maxCount != undefined) {
        if (typeof(req.body.maxCount)!='number'){
          errors.push({'maxCount': 'Type should be a number.'});
        }
        else {
          match_count['totalCount']['$lte']= parseInt(req.body['maxCount']);
        }
      }
    }
    else {
      res.status(400).send({'msg':'Request body is undefined.'});
      res.end();
    }

    if (errors.length != 0) {
      res.status(400).send({'errors':errors});
      res.end();
    }
    else {
      // Connect to MongoDB
      const db = client.db("getir-bitaksi-hackathon");
      db.collection("records").aggregate([
        { // first, filter by date to reduce the result set
          $match: match_date
        },
        { // then, calculate totalCount and only get the fields to be shown
          $project:{
            key: '$key',
            createdAt: '$createdAt',
            totalCount: {$sum: '$counts'},
            _id:0
          }
        },
        { // finally, filter by totalCount
          $match: match_count
        }
        // optionally, set a limit for the records to be fetched.
        // uncomment the part below to activate
        // ,
        // {
        //   $limit: 5
        // }
      ]).toArray( // convert the returned Cursor to an array.
        function (err, records) {
          if(err) { // in case of an error, let the user know.
            res.send(
              {
                'msg': err
              }
            );
            res.end();

          }
          else { // else, send the response in the requested jSON format.
            var response = {
              'code':0,
              'msg':'Success',
              'records': records
            };
            // Cache is full. Delete the response for the least recently sent request.
            if (Object.keys(request_response_dict).length == CACHE_SIZE) {
              var last_sent_list = Object.values(request_response_dict).map(e=>e['last_sent']);
              var least_recently_sent = last_sent_list.sort()[0];
              var key = time_sent_request_dict[least_recently_sent]; // the smallest date will be the first element
              console.log("Deleting request with last sent: ");
              console.log(least_recently_sent);
              console.log("Deleting request with key: ");
              console.log(key);
              delete request_response_dict[key];
              console.log("One record deleted from cache. Cache state now:");
              console.log(request_response_dict);
              console.log("\n");
            }
            var last_sent = Date.now();
            request_response_dict[JSON.stringify(req.body)] = {'response':response, 'last_sent': last_sent};
            time_sent_request_dict[last_sent] = JSON.stringify(req.body);
            console.log("Request - Response dictionary after new request");
            console.log(request_response_dict);
            console.log("====================\n");
            res.send(response);
            res.end();
          }
        }
      );
    }
  });
};
