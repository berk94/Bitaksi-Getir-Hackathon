# Bitaksi-Getir-Hackathon
The backend task for hackathon entry.

# Documentation
The app is deployed on a Heroku server here: [https://berk-bitaksi-getir-backend.herokuapp.com](https://berk-bitaksi-getir-backend.herokuapp.com)

### Endpoint (/searchRecord)
#### Sample Request
```
{
      "startDate" : "2016-01-26",
      "endDate" : "2017-02-02",
      "minCount" : 2700,
      "maxCount" : 3000
}
```
#### Sample Response
```
{
    "code": 0,
    "msg": "Success",
    "records": [
        {
            "key": "xqT9N0XwJ4qwU0GQ",
            "createdAt": "2016-07-06T06:54:46.169Z",
            "totalCount": 2700
        },
        {
            "key": "NMBUu74JC1bEGECM",
            "createdAt": "2016-07-06T13:12:01.175Z",
            "totalCount": 2800
        },
        {
            "key": "iL6mmHXYBtcOuBL3",
            "createdAt": "2016-07-06T17:21:55.885Z",
            "totalCount": 2700
        },
        ...
        ,
        {
            "key": "7T2VGTjro2HSJhDe",
            "createdAt": "2017-02-01T21:57:13.270Z",
            "totalCount": 3000
        }
    ]
}
```

## How to Run

First, you should install node by following the steps:

* [here](http://blog.teamtreehouse.com/install-node-js-npm-linux) for Linux (Unix) 

* [here](http://blog.teamtreehouse.com/install-node-js-npm-windows) for Windows

After installing node and npm, clone the repository to your local and go into the repository directory.
To install the required packages for the app, run the following command:
```
npm install
```
Then, enter either
```
node server.js
```
or
```
npm run dev
```
The latter one runs the server with [nodemon](https://github.com/remy/nodemon), which automatically restarts the server upon any saved changes.

