// Description:
//   Provides a web address where chat logs can be viewed and operators can interject
// Commands

// Dependencies
'use strict';

const moment = require('moment');
const exphbs = require('express-handlebars');
const socketio = require('socket.io');
const redis = require('../lib/redis');
const http = require('http');
const fs = require('fs');
const Handlebars = require('handlebars');
const uniq = require('uniq');

const API_ENDPOINTS_REDIS_KEY = 'apiEndpoints';
const apiEndpoints = [];
let logTemplate;

fs.readFile('./views/partials/log.handlebars', { encoding: "utf8" }, function (err, data) {
	if (err) throw err;
	logTemplate = Handlebars.compile(data);
});

function updateApiEndpoints(cb) {
	if (redis.redis) {
		redis.redis.get(API_ENDPOINTS_REDIS_KEY, function (err, data) {
			if (err) throw err;
			if (!data) {
				apiEndpoints.splice(0);
			} else {
				apiEndpoints.splice(0);
				apiEndpoints.push(...JSON.parse(data));
				uniq(apiEndpoints);
			}
			if (cb) cb(apiEndpoints);
		});
	}
}

function storeApiEndpoints(cb) {

	// Fetch latest apiEndpoints data then merge in the new array.
	if (redis.redis) {
		updateApiEndpoints(function (apiEndpoints) {
			console.log(apiEndpoints);
			redis.redis.set(API_ENDPOINTS_REDIS_KEY, JSON.stringify(apiEndpoints), cb);
		});
	}
}

function setupWebsocketServer(server, robot) {
	var io;
	var heartbeatN = 1;

	// Setup websockets to run on the same http server
	io = socketio(server);

	setInterval(function heartbeat() {
		io.emit('heartbeat', { id: heartbeatN++ });
	}, 1000);

	io.broadcastCancel = function (message) {
		io.emit('operatorTimeout', { id: message.commentId });
	};

	io.broadcastLog = function (message, response) {

		if (!message.fulfilled && response) {
			message.response = response;
		}

		message.robotTime = moment(message.timestamp, 'x').format();
		message.humanTime = moment(message.timestamp, 'x').format('lll');

		message.htmlEncoded = logTemplate(message);

		io.emit('log', message);
	};

	io.respondersCount = function () {

		const s = io.sockets.clients().sockets;

		return Object.keys(s).map(k => s[k])
		.reduce(function(soFar, ws) {
			return soFar + (ws.isResponding ? 1 : 0);
		}, 0);
	};

	io.on('connection', function(ws) {
		console.log('websocket connection open');

		ws.on('endpoint', function(data) {
			if (apiEndpoints.indexOf(data.endpoint.toLowerCase()) === -1) {
				apiEndpoints.push(data.endpoint.toLowerCase());
			}
			storeApiEndpoints();
		});
		ws.on('removeEndpoint', function(data) {
			apiEndpoints = apiEndpoints.filter(function (val) {
				return val.toLowerCase() !== data.endpoint.toLowerCase();
			});
			storeApiEndpoints();
		});
		ws.on('operatorStartEditing', function(data) {
			robot.emit('operatorStartEditing', data);
		});
		ws.on('replacementResponse', function(data) {
			robot.emit('replacementResponse', data);
		});
		ws.on('cancelIntervention', function(data) {
			robot.emit('cancelIntervention', data);
		});

		ws.on('stopResponding', function() { ws.isResponding = false; });
		ws.on('startResponding', function() { ws.isResponding = true; });

		// by default don't assume on operator interjection
		// the logs page makes a request to turn it on
		// once it has connected.
		ws.isResponding = false;

		ws.on('disconnect', function() {
			console.log('websocket connection close');
		});
	});

	return io;
}

module.exports = function (robot) {
	// Fetch a list of all of the websocket endpoints to be passed to the client
	updateApiEndpoints();

	// Save the robot on exit
	process.on('SIGTERM', robot.brain.save);

	// Hubots internal server does not expose the http server to attach an IO listener.
	// So we need to create a new server and proxy the requests to it.
	// hubots internal server's port is not exposed
	if (robot.router.listen === undefined) return;
	const app = robot.router;
	const server = http.createServer(app);
	robot.router = app;
	server.listen(process.env.PORT);
	console.log('Robot listening on port ' + process.env.PORT, '(process.env.PORT)');

	// Set up Websockets on the server
	app.wss = setupWebsocketServer(server, robot);

	// Set up the view engine
	app.engine('handlebars', exphbs({
		defaultLayout: false,
		helpers: {
			rfc822: function (str) { return moment(str).format('ddd, DD MMM YYYY HH:mm:ss ZZ'); }
		}
	}));
	app.set('view engine', 'handlebars');

	// Set headers
	app.use(function(req, res, next) {
		res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=60, stale-if-error=120');
		res.set('Timing-Allow-Origin', '*');
		res.removeHeader("x-powered-by");
		return next();
	});

	/**
	 * Routes
	 */

	app.get('/', function(req, res) {
		res.set('Content-Type', 'text/html');
		res.render('home');
	});

	app.get('/v1/logs', function(req, res){

		updateApiEndpoints();

		if (redis.redis) {
			redis.redis.lrange(redis.LOG_KEY, -1000, -1, function (err, replies) {
				if (err) {
					res.render('logs', {
						errorMessage: err
					});
					return console.error("error response - " + err);
				}

				res.render('logs', {
					logs: replies.reverse().map(function (itemString) {
						const item = JSON.parse(itemString);
						item.robotTime = moment(item.timestamp, 'x').format();
						item.humanTime = moment(item.timestamp, 'x').format('lll');
						return item;
					}),
					websocketApiLocations: apiEndpoints
				});
			});
		} else {
			res.render('logs', {
				errorMessage: "Redis not connected"
			});
		}
	});

	// Fallback to the 404 page
	app.use(function(req, res) {
		res.set('Content-Type', 'text/html');
		res.status(404);
		res.end('Not found');
	});
};
