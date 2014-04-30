// load the things we need
var mongoose = require('mongoose');
var Case = require('../models/case');
var User = require('../models/user');

// define the schema for our user model
var eventSchema = mongoose.Schema({
        event : {type: String, unique: true, required: true },
        name : String,
        startDate : Date,
        endDate : Date,
        priorTime : Date,
        priorEnd: Date,
        applyTime : Date,
        applyEnd: Date,
        min: Number,
        priorList : [{type : mongoose.Schema.ObjectId, ref: 'User'}],
        cases : [{type : mongoose.Schema.ObjectId, ref: 'Case'}],
        exceptors : [{
                    except :{type : mongoose.Schema.ObjectId, ref: 'User'},
                    num : Number
                    }],
        applier : [{type : mongoose.Schema.ObjectId, ref: 'User'}],
});


// create the model for case and expose it to our app
module.exports = mongoose.model('Event', eventSchema);
