var express = require('express'),
    app = express(),
    port = process.env.PORT || 9000,
    mongoose = require('mongoose'),
    User = require('./models/userModel'),
    bodyParser = require('body-parser');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/payment', { useMongoClient: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/doc'));

app.locals = {
    error: {
        emailNotExist: 'Email does not exist',
        wrongPassword: 'Wrong password',
        dataNotFound: 'Data not found',
        wrongAuthorization: 'Wrong authorization',
        noAuthorization: 'No authorization header',
        invalidSignature: 'Invalid signature',
        invalidToken: 'Invalid token',
        insufficientBalance: 'Insufficient balance'
    },
    message: {
        success: 'Request success'
    },
    schema: {
        'status': Boolean,
        'message': String,
        'data': Object
    },
    secret: 'bc39cd1549594c1844794a9fc97af752099b333c'
};

var routes = require('./routes/routes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('RESTful API server started on: ' + port);