var express = require('express'),
    app = express();

app.use(express.static(__dirname + '/public'));
//app.use(express.bodyParser());

var quotes = [
  { author : 'Audrey Hepburn', text : "Nothing is impossible, the word itself says 'I'm possible'!"},
  { author : 'Walt Disney', text : "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you"},
  { author : 'Unknown', text : "Even the greatest was once a beginner. Don't be afraid to take that first step."},
  { author : 'Neale Donald Walsch', text : "You are afraid to die, and you're afraid to live. What a way to exist."}
];

app.get('/', function(req,res) {
	//res.type('text/plain');
	//res.send('Using express framework');
	res.json(quotes);
});

app.get('/author/:id', function(req,res){

	var q = quotes[req.params.id];
	res.json(q);
})

app.post('/quote',function(req,res){
  if(!req.body.hasOwnProperty('author') || 
     !req.body.hasOwnProperty('text')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
	}

	var newquote = {
		author : req.body.author,
		quote : req.body.text
	};

	quotes.push(newquote);
	res.json(newquote);
})
app.listen(8080);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/')

/*var todoschema = new mongoose.Schema({
	name: String,
	Completed: Boolean,
	note: String,
	//updated_at: Date.now,
});*/

//var todo = mongoose.model("Todo",todoschema);
var todo = mongoose.model('Todo');
todo.create({name: 'Master Javscript3', completed: true, note: 'Getting better everyday3'}, function(err, todo){
    if(err) console.log(err);
    else console.log(todo);
});


