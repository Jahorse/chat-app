var express = require('express'),
	fs = require('fs'),
	hbs = require('hbs'),
	http = require('http'),
	path = require('path'),
	io = require('socket.io'),
	app = express();

// Create a partial template to use for the header and register it with hbs
var headerTemplate = fs.readFileSync(__dirname + '/views/_header.html', 'utf8');

hbs.registerPartial('headPartial', headerTemplate);

// This is just an example of how to use a helper
hbs.registerHelper('link', function(text, url) {
	text = hbs.Utils.escapeExpression(text);
	url = hbs.Utils.escapeExpression(url);

	var result = '<a href="' + url + '">' + text + '</a>';

	return new hbs.SafeString(result);
});

var oneDay = 86400000;

app.use(express.static(__dirname + '/static', { maxAge: oneDay }));

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.locals({ layout: false });
app.set('views', __dirname + '/views');

// Page definitions

app.get('/', function(req, res){
	console.log('Getting index.');
	
	res.render('index', {
		title: 'ChitChat',
		page: 'index'
	});
});

var users = [];

app.get('/users', function(req, res){
	console.log("Getting users.");
	
	res.render('users', {
		title: 'Users',
		page: 'users',
		users: users
	});
});


var server = http.createServer(app)
  , sio = io.listen(server);

server.listen(3000);
console.log("Express server listening on port 3000.");

sio.sockets.on('connection', function(socket) {
	console.log("User connected.")
	
	socket.on('username', function(data) {
		console.log(data.username);
		
		users.push(data.username);
		
		socket.set('username', data.username, function() {
			
			data.message = "Successfully connected as <strong>" + data.username + "</strong><br />";
			socket.emit('message', data);
		});
		
		data.message = "User <strong>" + data.username + "</strong> has connected<br />";

		socket.broadcast.emit('message', data);
	});
	
	socket.on('message', function (data) {
		
		console.log("Sending message: " + data.message);

		socket.broadcast.emit('message', data);
	});
	
	socket.on('disconnect', function (data) {
		socket.get('username', function(err, username) {
			console.log("User disconnected: " + username);
			
			data = {};
			data.message = "User <strong>" + username + "</strong> has disconnected<br />";
			socket.broadcast.emit('message', data);
			
			console.log("index: " + users.indexOf(username));

			users.splice(users.indexOf(username), 1);
		});
	});
});