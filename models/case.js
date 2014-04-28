// load the things we need
var mongoose = require('mongoose');
var Event = require('../models/event');

// define the schema for our user model
var caseSchema = mongoose.Schema({
        charger: String,
        category: String,
        startDate: Date,
        ampm: String,
        maxPosition : Number,
        _event : { type : mongoose.Schema.ObjectId, ref: 'Event'},
        attendants: [{type : mongoose.Schema.ObjectId, ref: 'User'}],
});


// create the model for case and expose it to our app
module.exports = mongoose.model('Case', caseSchema);

