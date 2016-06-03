// Description:
//   exposes assorted details such as scope
//   (intentionally not exposing this API to the help plugin)

var API = require("../lib/ftapis");
var redis = require('../lib/redis');

module.exports = function (robot) {

	var commands = [];

	commands.push('__secret');
	robot.respond(/__secret$/i, function (res) {
		res.send('Available secret commands\n`' + commands.join('`\n`') + '`');
		res.finish();
	});

	commands.push('__scope');
	robot.respond(/__scope$/i, function (res) {
		res = require('../lib/autolog')(res); // Log the query to the database
		var brain = require('../lib/scopedbrain')(res);
		var scope = brain.scope;
		console.log("DEBUG: behindTheScenes: __scope: scope=", scope, ", res=", res);
		res.send('__Admin View:\n scope=' + scope);
		res.finish();
	});

	commands.push('__redis stats');
	robot.respond(/__redis(\s+stats)?$/i, function (res) {

		// Log the query to the database
		res = require('../lib/autolog')(res);

		if (!redis.redis) {
			res.send('I don\'t seem to be connected to a Redis instance');
			return res.finish();
		}

		redis.redis.info('all', function (err, result) {
			if (err) {
				res.send(err);
				return res.finish();
			}
			res.send(result);
			res.finish()
		});
	});

	commands.push('__redis clear all');
	robot.respond(/__redis\s+clear\s+all$/i, function (res) {

		var user = res.user;
		var callback;

		// Log the query to the database
		res = require('../lib/autolog')(res);

		if (!redis.redis) {
			res.send('I don\'t seem to be connected to a Redis instance');
			return res.finish();
		}

		res.send('Are you sure you want to do that?');
		res.finish();

		robot.respond(/./i, function tempCatchAll(res) {
			if (user === res.user) {

				if (res.message.text.match(/yes/i)) {
					res.send('I\'m afraid ' + res.message.user.name);
					res.send('[EMPTYING BRAIN]');
					robot.brain.data._private = {};
					res.send('My mind is going...');
					res.send('[EMPTYING REDIS]');
					redis.redis.flushall();
					res.send('I can feel it...');
					res.send('It is recommended you now restart me, I may be a little unstable.');
					res.send('daisy daaissy, giivee me your...');
				} else {
					res.send('You didn\'t reply \'yes\' so I won\'t empty Redis');
				}
				res.finish();

				// Remove listener once responded to.
				robot.listeners = robot.listeners.filter(function (listener) {
					return listener.callback !== callback;
				});
			}
		});
		callback = robot.listeners[robot.listeners.length -1].callback;
	});

	commands.push('__redis clear logs');
	robot.respond(/__redis\s+clear\s+logs$/i, function (res) {

		var user = res.user;
		var callback;

		// Log the query to the database
		res = require('../lib/autolog')(res);

		if (!redis.redis) {
			res.send('I don\'t seem to be connected to a Redis instance');
			return res.finish();
		}

		res.send('Are you sure you want to do clear the logs?');
		res.finish();

		robot.respond(/./i, function tempCatchAll(res) {
			if (user === res.user) {
				if (res.message.text.match(/yes/i)) {
					redis.emptyLogs(function (err) {
						if (!err) return res.send('Logs cleared');
						res.send(err);
						res.finish();
					});
				} else {
					res.send('You didn\'t reply \'yes\' so I won\'t clear the logs');
					res.finish();
				}

				// Remove listener once responded to.
				robot.listeners = robot.listeners.filter(function (listener) {
					return listener.callback !== callback;
				});
			}
		});
		callback = robot.listeners[robot.listeners.length -1].callback;
	});

	commands.push('__redis trim logs');
	robot.respond(/__redis\s+trim\s+logs$/i, function (res) {

		// Log the query to the database
		res = require('../lib/autolog')(res);

		if (!redis.redis) {
			res.send('I don\'t seem to be connected to a Redis instance');
			res.finish();
		}

		redis.trimLogs(function (err) {
			if (!err) {
				res.send('Logs trimmed');
				return res.finish();
			}
			res.send(err);
			res.finish();
		});
	});

	commands.push('__brain dump <regexp>');
	robot.respond(/__brain\s+dump(?:\s+(.+))?$/i, function (res) {
		res = require('../lib/autolog')(res); // Log the query to the database
		var pat = new RegExp((res.match[1] || '.*'), 'i');
		var results = Object.keys(robot.brain.data._private).filter(function(key) {
			return pat.test(key);
		});

		res.send("Number of matches: "+results.length+".  Showing up to 20.");
		res.send(results.slice(0, 20).join('\n'));
		res.finish();
	});

	commands.push('__brain rm [RegExp pattern]');
	robot.respond(/__brain\s+rm\s+(.+)$/i, function (res) {

		// Log the query to the database
		res = require('../lib/autolog')(res);

		var pat = new RegExp(res.match[1], 'i');
		var count = 0;
		var results = Object.keys(robot.brain.data._private).filter(function(key) {
			return pat.test(key);
		}).forEach(function(key) {
			robot.brain.remove(key);
			count++;
		});

		res.send('Removed '+count+' keys from the brain');
		res.finish();
	});
};
