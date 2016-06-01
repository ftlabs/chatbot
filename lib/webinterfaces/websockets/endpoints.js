
var WSMessage = require('./wsmessage');

module.exports = function setUpSlackSlashCommandEndpoints(robot) {
	var wss = robot.router.wss;

	robot.router.get('/v1/websocket-api-demo', function(req, res){
		res.render('interface');
	});

	robot.router.get('/v1/web-widget', function(req, res){
		res.render('widget');
	});

	wss.on("connection", function(socket) {

		/**
		 * data description:
		 * userId                            <-- unique userId (persist?)
		 * messageId                         <-- unique id probable based on timestamp and user id
		 * name                              <-- friendly name
		 * text                              <-- message text
		 */
		socket.on('message', function (data) {

			// get a new (or existing) User object
			var user = robot.brain.userForId(data.userId, {
				room: 'web_channel',
				name: data.name
			});

			// prepend the robot name to make it a dm
			var text = robot.name + ": " + (data.text || "");

			// Generate an id for the message
			var id = data.messageId;

			// send the message to the hubot
			robot.receive(
				new WSMessage(user, text, id, socket)
			);
		});
	});
};
