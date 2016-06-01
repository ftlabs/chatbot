
var urlencodedParser = require('body-parser').urlencoded({ extended: false });
var SlackWebMessage = require('./slackmessage');

var SLACKHOOK_ENDPOINTS_URLS_REDIS_PREFIX = 'slackhook_for_domain_';
var SLACKHOOK_ENDPOINTS_TOKENS_REDIS_PREFIX = 'slackhook_secret_for_domain_';

var slackHookToken = process.env.HUBOT_SLACK_TOKEN;
var slackHookUrl = process.env.SLACK_HOOK_URL;

// Whether the endpoints for custom slackHook should be present
var slackHookCustom = !(slackHookToken || slackHookUrl);

module.exports = function setUpSlackSlashCommandEndpoints(robot) {
	var app = robot.router;

	if (slackHookCustom) {
		app.post('/v1/slack/add-hook-target', urlencodedParser, function(req, res) {
			if (req.body.url && req.body.domain && req.body.token) {
				robot.brain.set(SLACKHOOK_ENDPOINTS_URLS_REDIS_PREFIX + req.body.domain, req.body.url);
				robot.brain.set(SLACKHOOK_ENDPOINTS_TOKENS_REDIS_PREFIX + req.body.domain, req.body.token);
				res.json({
					success: true
				});
			} else {
				res.status(400);
				res.json({
					success: false
				});
			}
		});
	}


	app.post('/v1/slack/web-interface', urlencodedParser, function(req, res) {
		var target, token;
		if (slackHookCustom) {
			target = robot.brain.get(SLACKHOOK_ENDPOINTS_URLS_REDIS_PREFIX + req.body.team_domain);
			token = robot.brain.get(SLACKHOOK_ENDPOINTS_TOKENS_REDIS_PREFIX + req.body.team_domain);
		} else {
			target = slackHookUrl;
			token = slackHookToken;
		}
		if (target && token === req.body.token) {
			console.log('Sending new message in reply to', req.body);
			robot.receive(new SlackWebMessage(robot.brain.userForId(req.body.user_id, {
				room: req.body.channel_id
			}), robot.name + ": " + (req.body.text || ""), req.body.user_id+'_'+Date.now(), robot, res, target));
		} else {
			res.status(400);
			res.end('No endpoint associated with ' + req.body.token);
		}
	});
};