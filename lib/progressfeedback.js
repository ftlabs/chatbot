/*
 * Emits a message into a channel after a delay if no other message is sent
 * in that time.  Ideal for async responses that can take some time, so
 * when a user says "hubot calculate pi to 3 million decimal places", the
 * bot can reply very quickly with a message showing that the task is in
 * progress
 */

module.exports = function(res, delay, msg) {
	var timer;
	var origSend = res.send;
	delay = delay || 500;
	msg = msg || "Working on it...";

	timer = setTimeout(function() {
		res.send(msg);
	}, delay);

	res.send = function() {
		origSend.apply(this, arguments);
		clearTimeout(timer);
	};

	return res;
};
