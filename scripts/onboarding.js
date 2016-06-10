// Description:
//   Send a welcome message to new users.
'use strict';
const WebMessage = require('../lib/webinterfaces/webmessage');

const SEEN_LOG_PREFIX = "USER_SEEN_V0.12_";
const onboardMessage = [ '*Welcome to the FT Bot*.',
						'I am a robot, not a real person, but I can help connect you with content and services from the Financial Times. Try saying ',
						'`price apple`',
						'`search obama`',
						'`recommend linkedin`',
						'`define amortisation`',
						'For a full list of everything I understand, say `help`.'].join("\n");

function genKey(robot, user) {
	return SEEN_LOG_PREFIX +
		robot.adapterName + '_' +
		user.name + '_' +
		user.id;
}

function dmWelcomeMessage(res) {

	if (res.message instanceof WebMessage) {
		res.message.dm(onboardMessage);
		res.message.finish();
		return;
	}

	switch(res.robot.adapterName) {
	case 'slack':
		res.robot.send({room: res.message.user.name}, onboardMessage);
		res.finish();
		break;
	default:
		res.robot.send({user: res.message.user}, onboardMessage);
		res.finish();
	}
}

module.exports = function (robot) {

	// Tweaked from hubot source
	robot.enter(module.exports.onboard);
	robot.respond(/(yo|hi|he+l+o+|wassup|hey|nice\s+to\s+meet\s+you|(who|what)\s+are\s+you\??)\!*(\s+|$)/i, function (res) {

		// Since this is being handled in dm log the response without sending a message to the client.
		require('../lib/autolog')(res).silentlyLog();

		dmWelcomeMessage(res);
	});
};

module.exports.onboard = function (res) {
	let onboarded = false;
	if (res.message instanceof WebMessage) {
		return false;
	}
	if (process.env.NO_ONBOARDING) return false;
	if (!res.robot.brain.get(genKey(res.robot, res.message.user))) {
		dmWelcomeMessage(res);
		onboarded = true;
	}
	res.robot.brain.set(genKey(res.robot, res.message.user), Date.now());
	return onboarded;
};
