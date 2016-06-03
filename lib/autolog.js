'use strict';

const redis = require('./redis');

function shallowClone (o) {
	return require('util')._extend({}, o);
}

module.exports = function(res) {
	const {user, text, id} = res.envelope.message;
	console.log("AUTOLOG: res.envelope.message=" + JSON.stringify({user, text, id}));
	var origSend = res.send;
	var newRes = shallowClone(res);

	newRes.silentlyLog = function() {
		redis.log(res, '', true);
	};

	newRes.fail = function(message) {

		// Log the failure, wit to see if a new message is forthcoming
		redis.log(res, message, false)
		.then(function (newMessage) {
			origSend.apply(res, [newMessage]);
		}, function (err) {

			if (err) console.error(err);

			// No custom message forthcoming so send the default message.
			origSend.apply(res, [message]);
		});
	};

	newRes.finish = res.finish.bind(res);

	newRes.send = function(...message) {
		redis.log(res, message, true);
		origSend.apply(res, message);
	};

	return newRes;
};
