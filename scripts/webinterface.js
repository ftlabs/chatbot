// Description:
//	 Adds slash commands peudo-adapter interface for Slack

var webinterfaces = require('../lib/webinterfaces/');

module.exports = function (robot) {

	if (robot.router.listen === undefined) return;

	if (process.env.HUBOT_WEB_ENDPOINTS) {
		robot.Response = webinterfaces(robot).Response;
	}
};
