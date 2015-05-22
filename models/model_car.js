var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var carSchema = new Schema({
	user : String,
	model : String,
	price : Number,
	desc : String,
	datetime : Date,
});

module.exports = mongoose.model('cars',carSchema);