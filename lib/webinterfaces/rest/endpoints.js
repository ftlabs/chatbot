
var RestMessage = require('./restmessage');
var urlencodedParser = require('body-parser').urlencoded({ extended: false });

module.exports = function setUpRestEndpoints(robot) {
	var app = robot.router;
	var user = robot.brain.userForId(-1, {
		room: 'web_channel',
		name: 'anonymous_user'
	});
	app.post('/v1/rest', urlencodedParser, function(req, res) {
		if (req.body.message) {

			// prepend the robot name to make it a dm
			var text = robot.name + ": " + req.body.message;

			// Generate an id for the message
			var id = Date.now();

			// send the message to the hubot
			robot.receive(
				new RestMessage(user, text, id, res)
			);
		}
	});
};