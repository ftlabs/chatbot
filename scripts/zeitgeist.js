// Description:
//   lists the most used primaryThemes from last 100 days
//
// Commands:
//   hubot zeitgeist <type> - Displays most common recent themes (<type> can be people, orgs, regions, topics; or leave blank)

'use strict';
const API = require("../lib/ftapis");
const numbers = require('../lib/numberedlist');

const handleZeitgeistRecency = function(recencyFnName, recencyText, res){
	res = require('../lib/autolog')(res); // Log the query to the database
	const flavour = res.match[1];
	const display_flavour = flavour ? ' *' + flavour + '*' : '';
	const topicContext = require('../lib/scopedlist').getTopicContext(res);

	API.primaryThemes[recencyFnName](flavour).then(function(topics) {
		if (topics.length === 0) {
			if (flavour) {
				res.send('If you specify a type, it needs to be one of people, orgs, regions, topics, or left blank');
			} else {
				res.send('No zeitgeist to be had today, alas. Probably a bug.');
			}
		} else {
			res.send("zeitgeist" + display_flavour + ': ' + recencyText + '\n' + numbers(topicContext.add(topics)));
		}
	})
	.catch(function(e) {
		res.send('zeitgeist' + display_flavour + ': none');
		console.log(e);
	})
	.then(function () {
		res.finish();
	});
};

module.exports = function (robot) {
	robot.respond(/(?:z100|zeitgeist100)\s*$/i, handleZeitgeistRecency.bind(this, 'getPrimaryThemes100Days', 'over the last 100 days'));
	robot.respond(/(?:z100|zeitgeist100)\s+(\S.*)/i, handleZeitgeistRecency.bind(this, 'getPrimaryThemes100Days', 'over the last 100 days'));
	robot.respond(/(?:z|zeitgeist)\s*$/i, handleZeitgeistRecency.bind(this, 'getPrimaryThemes1Week', 'over the last few days'));
	robot.respond(/(?:z|zeitgeist)\s+(\S.*)$/i, handleZeitgeistRecency.bind(this, 'getPrimaryThemes1Week', 'over the last few days'));
};
