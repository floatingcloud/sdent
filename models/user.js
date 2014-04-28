// load the things we need
var mongoose = require('mongoose');
var Case = require('../models/case');


// define the schema for our user model
var userSchema = mongoose.Schema({

        id : {type: String, unique: true, required: true },
        password : {type: String, required: true },
        name : {type: String, required: true },
        studentNumber :{type: String, required: true },
        number: {type: String, required: true },
        lastLoginTime : Date,
        cases : [{type : mongoose.Schema.ObjectId, ref: 'Case'}]
});
// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

