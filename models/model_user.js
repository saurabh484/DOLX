var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	name : {type: String, required: true},
	password : {type: String, required: true},
	admin : {type: Boolean, required: true},
	verified : {type: Boolean, required: true}
});

module.exports = mongoose.model('userTable',userSchema);