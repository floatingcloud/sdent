// load the things we need
var mongoose = require('mongoose');
var Case = require('../models/case');
var User = require('../models/user');
var Except = require('../models/exceptor');

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
        //exceptionList : [{type : mongoose.Schema.ObjectId, ref: 'Except'}],
        cases : [{type : mongoose.Schema.ObjectId, ref: 'Case'}],
        //tracks : [{type : mongoose.Schema.ObjectId, ref: 'Track'}],
        exceptors : [{
                    except :{type : mongoose.Schema.ObjectId, ref: 'User'},
                    num : Number
                    }],
        applier : [{
                    who :{type : mongoose.Schema.ObjectId, ref: 'User'},
                    applyNum : Number
                  }]
});


// create the model for case and expose it to our app
module.exports = mongoose.model('Event', eventSchema);
