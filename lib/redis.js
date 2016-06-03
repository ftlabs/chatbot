/**
 * redis.js
 *
 * Logs the response to queries made to the bot, it does not log the response text
 * (since that can be long) but it does log the message which triggered the response
 * and whether or not it has been fulfilled.
 *
 * If an unfulfilled request comes through and an operator is looking at the logs page
 * they will be prompted for a more suitable reply than the default error message.
 *
 * This will be logged in addition if the opreator replies instead of the robot.
 */

var Redis = require("redis");
var LOG_KEY = "CHATBOT_LOG_V0.2";
var redis;
var messageTimeout = 10000;
var operatorTimeout = 60000;
var logLength = 5000;
var logTrimInterval = 1000*3600; //Trim the logs hourly

if (process.env.REDISTOGO_URL) {
	var rtg = require("url").parse(process.env.REDISTOGO_URL);
	redis = Redis.createClient(rtg.port, rtg.hostname);
	if (rtg.auth) redis.auth(rtg.auth.split(":")[1]);
} else {
	redis = Redis.createClient();
}

function handleConnectErr(err) {
	if (/ECONNREFUSED/.test(err.message)) {
		console.error("Error connecting to redis, /v1/logs will be unavailable");
	} else {
		console.log(err.message);
	}
	redis.removeListener("error", handleConnectErr);

	// Fail silently from now on.
	redis.addListener("error", function () {});
	redis.end(false);
	redis = null;
	module.exports.redis = null;
}

redis.addListener("error", handleConnectErr);

function emptyLogs(cb) {
	if (redis) redis.del(LOG_KEY, cb || function () {});
}

function trimLogs(cb) {
	if (redis) redis.ltrim(LOG_KEY, 0, logLength - 1, cb || function () {});
}

setInterval(trimLogs, logTrimInterval);
trimLogs();

function log(res, response, fulfilled, options) {

	options = options || {};

	var now = Date.now();

	var message = {
		fulfilled: fulfilled,
		adapter: res.robot.adapterName,
		message: res.message.text,
		user: res.message.user,
		timestamp: now,
		commentId: options.commentId || now + '_' + res.message.user.name + '_' + res.message.user.id
	};

	if (options.includeReply) {
		message.response = response;
	}

	if (redis) redis.rpush(LOG_KEY, JSON.stringify(message));

	if (res.robot.router.wss) res.robot.router.wss.broadcastLog(message, response);

	return new Promise(function (resolve, reject) {

		if (fulfilled) return resolve();

		// if no one is watching just send the default straight away
		if (!res.robot.router.wss || !res.robot.router.wss.respondersCount()) {
			return reject();
		}

		function failToRespond() {
			res.robot.router.wss.broadcastCancel(message);
			reject();
		}

		// Allow the client to countdown for expiration.
		message.expire = Date.now() + messageTimeout;

		var t = setTimeout(failToRespond, messageTimeout, response);

		function onOperatorStartEditing(data) {
			if (data.commentId === message.commentId) {
				clearTimeout(t);
				t = setTimeout(failToRespond, operatorTimeout);

				// Pricing can take a while, so mix in progress feedback behaviour
				res.send = require('../lib/progressfeedback')(res).send;
			}
		}

		function onReplacementResponse(data) {
			if (data.commentId === message.commentId) {
				clearEvents();

				// Log again but mark it as fulfilled and include the response
				// so that the operators responses are also logged to the redis db
				// keep the old commentId
				log(res, data.newResponse, true, {
					includeReply: true,
					commentId: message.commentId
				});
				resolve(data.newResponse);
			}
		}

		function onCancelResponse(data) {
			if (data.commentId === message.commentId) {
				clearEvents();
				failToRespond();
			}
		}

		res.robot.events.once('operatorStartEditing', onOperatorStartEditing);
		res.robot.events.once('replacementResponse', onReplacementResponse);
		res.robot.events.once('cancelIntervention', onCancelResponse);

		function clearEvents() {
			clearTimeout(t);
			res.robot.events.removeListener('operatorStartEditing', onOperatorStartEditing);
			res.robot.events.removeListener('replacementResponse', onReplacementResponse);
			res.robot.events.removeListener('cancelIntervention', onCancelResponse);
		}
	});
}

module.exports.redis = redis;
module.exports.log = log;
module.exports.emptyLogs = emptyLogs;
module.exports.trimLogs = trimLogs;
module.exports.LOG_KEY = LOG_KEY;

