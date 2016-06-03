// Description:
//   Messages the user when the command wasn't recognised.

// Dependencies
var onboard = require('./onboarding').onboard;

module.exports = function (robot) {

	// Tweaked from hubot source
	var getRespondRegex = (function (regex) {
		var alias, modifiers, name, newRegex, pattern, re;
		re = regex.toString().split('/');
		re.shift();
		modifiers = re.pop();
		if (re[0] && re[0][0] === '^') {
			this.logger.warning("Anchors don't work well with respond, perhaps you want to use 'hear'");
			this.logger.warning("The regex in question was " + (regex.toString()));
		}
		pattern = re.join('/');
		name = this.name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
		if (this.alias) {
			alias = this.alias.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
			newRegex = new RegExp("^\\s*[@]?(?:" + alias + "[:,]?|" + name + "[:,]?)\\s+(?:" + pattern + ")", modifiers);
		} else {
			newRegex = new RegExp("^\\s*[@]?" + name + "[:,]?\\s+(?:" + pattern + ")", modifiers);
		}
		return newRegex;
	}).bind(robot);

	robot.catchAll(function fallbackListenerCallback(res) {

		if (!res.message.text) return;


		// if it is addressing the robot
		if (res.message.text.match(getRespondRegex('.'))) {

			console.log("DEBUG: fallback: res.message.text=", res.message.text);

			res = require('../lib/autolog')(res);

			var failMessage = 'I don\'t know what that means.  Say `hi` to find out about me or `help` if you want to know everything I can do.';
			var m;

			if (res.message.text.match(/\`/)) {
				res.send("Try again without the back-tick quotes.");
			} else if (m = res.message.text.match(/^\@?ft(?:-bot)?[:,]?\s+(\@?ft(?:-bot)?)/)) {
				res.send("In this channel you don't need to start your message with " + m[1]);
			} else if (!onboard(res)) { // Send them the welcome message if they need it
				// otherwise let them know their query went unfulfilled
				res.fail(failMessage);
			}
		}
	});
};
