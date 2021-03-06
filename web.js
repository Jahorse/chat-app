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
	res.render('index', {
		title: 'ChitChat',
		page: 'index'
	});
});

var users = [];

app.get('/users', function(req, res){
	res.render('users', {
		title: 'Users',
		page: 'users',
		users: users
	});
});


var server = http.createServer(app)
  , sio = io.listen(server);

var port = process.env.PORT || 5000;

server.listen(port);

sio.sockets.on('connection', function(socket) {
	socket.on('username', function(data) {
		users.push(data.username);
		
		socket.set('username', data.username, function() {
			data.message = "Successfully connected as <strong>" + data.username + "</strong><br />";
			socket.emit('message', data);
		});
		
		data.message = "User <strong>" + data.username + "</strong> has connected<br />";

		socket.broadcast.emit('message', data);

		data = {};
		data.userList = "";

		for (var i = 0; i < users.length; i++) {
			data.userList += "<span>" + users[i] + "</span><br />";
		}

		sio.sockets.emit('userListUpdate', data);
	});
	
	socket.on('message', function (data) {
		sio.sockets.emit('message', data);
	});
	
	socket.on('disconnect', function (data) {
		socket.get('username', function(err, username) {
			data = {};
			data.message = "User <strong>" + username + "</strong> has disconnected<br />";
			socket.broadcast.emit('message', data);
			
			users.splice(users.indexOf(username), 1);

			data = {};
			data.userList = "";

			for (var i = 0; i < users.length; i++) {
				data.userList += "<span>" + users[i] + "</span><br />";
			}

			sio.sockets.emit('userListUpdate', data);
		});
	});
});