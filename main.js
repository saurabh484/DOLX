var express = require('express');
var app = express();

var router = express.Router();
var auth_router = express.Router();

var morgan = require('morgan');
app.use(morgan('dev'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var jwt = require('jsonwebtoken');

var verifyToken = require('./models/model_token.js')
var User = require('./models/model_user.js');
var Car = require('./models/model_car.js')
var config = require('./config.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/');

var nodemailer = require('nodemailer');					//Email Configuration
var smtpTransport = nodemailer.createTransport({
	service: 'Mailgun',
	auth:{
		user: 'postmaster@sandbox57602b4e13a840c89eae3eafab0d4fb9.mailgun.org',
		pass: 'kondapur'
	}
});
var mailoptions,host,link;
var mail_token;

app.use(express.static(__dirname + '/public'));
/*var newcar = new Car({
	user : 'Saurabh',
	model : 'Swift',
	price : 10000,
	desc : 'Desc1',
	datetime : 'October 13, 2014',
})

newcar.save(function(err){
	if(err) conole.log(err);
});

Car.find({},function(err,dbcars){
	if(err) throw err;

	console.log(dbcars)
})*/




router.route('/authenticate')
	.post(function(req,res){
	User.findOne({name : req.body.user}, function(err,user){

		if(err)
			throw(err);

		if(!user){
			res.json({success : false , message : 'Authentication failed. User not found'});
		}

		else if(user){
			if(user.password != req.body.password){
				res.json({success : false, message : 'Authentication failed. Incorrect Password'});
			}

			else{
				var token = jwt.sign(user,config.secret,{expiresInMinutes : 1440});
				res.json({
					success : true,
					message : 'token created',
					token : token
				})
			}
		}
	});
});

router.route('/usersignup')
	.post(function(req,res){

		//console.log(req);

		var newUser = new User();
		newUser.name = req.body.name_input;
		newUser.password = req.body.name_pass;
		newUser.admin = req.body.admin;
		newUser.verified = req.body.verified;

		newUser.save(function(err){
			if(err)
				console.log(err);
			else
			console.log('User created successfully');
			//res.json({message : 'User Created successfully'})


		});

		var verificationToken = new verifyToken.verificationTokenModel({
			_userId : newUser.id 	 
		});

		verificationToken.createVerificationToken(function(err,token){
			mail_token=token;
			if(err)
				return console.log('could not create token',err)

			else
				console.log(token);
				//res.json({verificationtoken: token});
		});

														//Send email verification link to user
		mailoptions={
			from: 'desacolx.com',
			to: req.body.name_input,
			subject: 'Email Confirmation for DOLX',
			text: 'Text contents',
			html: 'Click <a href=http://localhost/verify/'+mail_token+'>here</a> verify your email address'
		}
		console.log(mailoptions);		

		smtpTransport.sendMail(mailoptions,function(err,response){
			if(err){
				console.log(err);
				res.send(err);
			}
			else{
				console.log('message sent');
				res.send('link confirmation sent');
			}
		});
	});

router.route('/verify/:verifytoken')
	.get(function(req,res){
		var token = req.params.verifytoken;
		verifyToken.verifyUser(token,function(err){
			if(err)
				res.json({message: 'User not verified'})
			else
				res.json({message: 'User verified successfully'})
		})
	})

router.route('/users/:username')
	.get(function(req,res){
		User.find({name: req.params.username},function(err,users){
			if(err)
				res.json({message: "user not found"});

			res.json(users);
		})
	})

router.route('/users')
	.get(function(req,res){
		User.find({},function(err,users){
			if(err)
				throw(err);

			//User.remove().exec();
			res.json(users);
		});
	});


router.route('/cars')

	.post(function(req,res){
		var newcar = new Car();

		newcar.user = req.body.user;
		newcar.model = req.body.model;
		newcar.price = req.body.price;
		newcar.desc = req.body.desc;
		newcar.datetime = req.body.datetime;

		newcar.save(function(err){
			if(err) res.send(err);

			res.json({message: 'Car Created'});
	});

});

router.route('/cars')	
	.get(function(req,res){
		Car.find(function(err,cars){
			if(err)
				res.send(err);

			res.json(cars);
		});
});

auth_router.use(function(req,res,next){
	console.log(req.body); 	//Request checking or stats

	var token = req.body.token || req.headers['x-access-token'] || req.query.token;
	

	if(token){
		jwt.verify(token,config.secret,function(err,decoded){
			if(err)
				return res.json({success : false, message : 'Failed to authenticate token'})

			else {
				
				User.findOne({ _id: decoded.iss }, function(err, user) {
  				req.user = user;
				});

				console.log(req);

				req.decoded = decoded;
				next();
			}
		});

	}

	else{

		return res.status(403).send();
	}

});

auth_router.route('/cars/:user')
	.get(function(req,res){
		Car.findOne({user: req.params.user}, function(err,car){
			if(err)
				res.send(err);
			console.log('here');
			res.json(car)
		});
	});


app.use('/authenticated',auth_router);
app.use('/api',router);
app.listen(8080);
