var mongoose =  require('mongoose');
var Schema = mongoose.Schema;

var User = require('./model_user.js');

var uuid = require('uuid');

var tokenVerificationSchema = new Schema({
	_userId: {type: Schema.ObjectId, required: true, ref: 'userTable'},
	token: {type: String, required: true},
	createdAt: {type: Date, required: true, default: Date.now, expires: '5h'} 
});

tokenVerificationSchema.methods.createVerificationToken = function(done){
	var verificationtoken = this,
	token = uuid.v4();
	verificationtoken.set('token',token);
	verificationtoken.save(function(err){
		if(err)
			console.log('Error creating token');
		
		else return done(err,token);
	});
}

var verificationTokenModel = mongoose.model('VerificationToken',tokenVerificationSchema);
exports.verificationTokenModel = verificationTokenModel;

exports.verifyUser = function(token,done){
	verificationTokenModel.findOne({token: token},function(err,doc){
		if(err)
			return err;
		console.log(doc);
		User.findOne({_id : doc._userId},function(err,user){
			if(err)
				return err;
			else
				user.set('verified',true);
				user.save(function(err){
					if(err) return err;
					
				});
		});

	});
}