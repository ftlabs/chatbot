// Description:
//   Some polite replies to plesantries

module.exports = function (robot) {

	robot.respond(/(thanks|thank\s+you|ta|cheers|thx|super)$/i, function (res) {
		res.send(res.random([
			"No problem",
			"You're welcome",
			"You are most welcome",
			"Not at all",
			"It's what I'm here for",
			"Glad to help"
		]));
		res.finish();
	});

	robot.respond(/(bye|kthxbye|good\s*bye|(see|catch)\s+y(ou|a)\s+later|laters)$/i, function (res) {
		res.send(res.random([
			"I'll be here",
			"Goodbye",
			"See you later"
		]));
		res.finish();
	});

	robot.respond(/(good\s+(morning|afternoon|evening)|hello\s+again)/i, function (res) {
		res.send(res.random([
			"It is, isn't it",
			"Hi",
			"And to you"
		]));
		res.finish();
	});

	robot.respond(/(shut\s+up|stop|go\s+away|(fuck|sod|bugger)\s+off|quiet(\s+down)?)$/i, function (res) {
		res.send("If you would like me to stop alerting, say `alerts off`.  If you want me to stop interacting with you at all, you can unfriend me or remove my integration on your instant message service.  If you are using a corporate chat system, consult your suppport team.");
		res.finish();
	});

};
