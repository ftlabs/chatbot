// Description:
//   shares recently surfaced articles with a nominated recipient by email
//
// Commands:
//   hubot share <article-number> with <recipient-email> - Sends an article link to a friend or colleague

var API = require("../lib/ftapis");
var emailPat = new RegExp('^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$', 'i');

module.exports = function (robot) {

	robot.respond(/share(\s+\S+)?$/, function(res) {
		res = require('../lib/autolog')(res);
		res.send('You need to specify an article to share and an email address to share it with, e.g. share A5 with joe@bloggs.com');
	});

	robot.respond(/share\s+(\#|number\s+)?(\w?\d+)(\s+with)?\s+([\w\d\s\.\-\@\+]+)/i, function (res) {
		var storyNo      = res.match[2];
		var recip        = res.match[4];
		var storyContext = require('../lib/scopedlist').getStoryContext(res);
		var story        = storyContext.get(storyNo);

		// Log the query to the database
		res = require('../lib/autolog')(res);

		if (!storyContext.get(1)) {
			return res.send("I don't know which story you're referring to. Use `search` to find some stories to share");
		} else if (!story) {
			return res.send("The list of stories available to share is from 1 to "+storyContext.length+".  There is no story "+(storyNo));
		}

		if (!emailPat.test(recip)) {
			return res.send("Recipient must be an email address, but I didn't recognise '"+recip+"' as an email address.  Try again?");
		}

		API.share.send(recip, story)
			.then(function() {
				res.send("Sent *" + story.title + "* to " + recip);
			})
			.catch(function(err) {
				res.send("Sorry, a problem prevented your email from being sent");
				console.log('Error sending email this: err: ', err);
			})
		;
	});
};
