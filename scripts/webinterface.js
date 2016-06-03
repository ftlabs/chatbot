// Description:
//	 Adds slash commands peudo-adapter interface for Slack

var webinterfaces = require('../lib/webinterfaces/');

module.exports = function (robot) {

	if (robot.router.listen === undefined) return;

	robot.Response = webinterfaces(robot).Response;

	// Always have the rest endpoint enabled;
	require('../lib/webinterfaces/rest')(robot);

	if (process.env.HUBOT_WEB_ENDPOINTS) {
		// Set up endpoints which require WebSockets
		require('../lib/webinterfaces/slack')(robot);
		require('../lib/webinterfaces/websockets')(robot);
	}
};
