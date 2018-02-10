"use strict";

module.exports = function(app,client){
  app.post('/searchRecords', (req, res) => {
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
        if (req.body.minCount.match(/^\-?[0-9]+$/) == null){
          errors.push({'minCount': 'Type should be a number.'});
        }
        else {
          match_count['totalCount']['$gte']= parseInt(req.body['minCount']);
        }
      }
      if (req.body.maxCount != undefined) {
        if (req.body.maxCount.match(/^\-?[0-9]+$/) == null){
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
          res.send(
            {
              'code':0,
              'msg':'Success',
              'records': records
            }
          );
          res.end();
        }
      }
    );
  });
};
