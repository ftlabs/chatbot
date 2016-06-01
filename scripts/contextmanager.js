// Description:
//   Allows management of context lists
//
// Commands:
//   hubot topics - Lists your recent history
//   hubot topics all - Lists your full history
//   hubot topics clear - Empties your history
//   hubot articles - Lists your recent history
//   hubot articles all - Lists your full history
//   hubot articles clear - Empties your history
//   hubot prices - Lists your recent history
//   hubot prices all - Lists your full history
//   hubot prices clear - Empties your history
//   hubot definitions - Lists your recent history
//   hubot definitions all - Lists your full history
//   hubot definitions clear - Empties your history

var API = require("../lib/ftapis");
var numbers = require('../lib/numberedlist');
var ScopedList = require('../lib/scopedlist');
var moment = require('moment');
var sessionLengthHours = 24;
var oneHour = 60 * 60 * 1000;
var tidyUpInterval = oneHour;
var formatters = {
	articles: function(obj) {
		var pub = moment(obj.lastPublishDateTime).fromNow();
		var url = ('shorturl' in obj)? obj.shorturl : obj.url;
		return obj.title + ', _published ' + pub + '_ (' + url + ')';
	},
	prices: function(obj) {
		return (typeof obj === 'string') ? obj : "*"+obj.basic.name+"* ("+obj.basic.symbol+")";
	}
};

module.exports = function (robot) {

	// Enormously massive hack alert: this module ought to access scoped
	// lists through the scopedlist module and not be aware of the format
	// of the key.  We also use updatetime here which is essentially a
	// private thing set inside scopedlist
	function tidyup(res) {
		var countKeys = 0;
		var countFound = 0;
		var countCleaned = 0;
		Object.keys(robot.brain.data._private)
			.filter(function(key) {
				countKeys++;
				return (/^[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+\/context\/[^\/]+$/i).test(key);
			})
			.forEach(function(listKey) {
				countFound++;
				var interval = res && res.match[1] ? 0 : sessionLengthHours * oneHour;
				var data = robot.brain.get(listKey);
				if (data && (!data.updatetime || data.updatetime < ((new Date()).getTime() - interval))) {
					console.log('Tidyup: cleaned '+listKey);
					robot.brain.remove(listKey);
					countCleaned++;
				}
			})
		;
		if (res) res.send(countKeys+' keys in the brain. '+countFound+' are context lists, '+countCleaned+' were cleaned.');
	}

	var pattern = new RegExp("("+ScopedList.getTypes().join('|')+")(?:\\s+(all|clear))?$", "i");
	robot.respond(pattern, function (res) {
		var type    = (res.match[1] || '').toLowerCase();
		var action  = (res.match[2] || '').toLowerCase();
		var context = ScopedList.getByType(res, type);

		res = require('../lib/autolog')(res);

		if (action === 'clear') {
			context.clear();
			res.send('Cleared '+type+' history.');

		// Not clearing so it's a list action, either limited or full
		} else {
			var items = (action === 'all') ? context.listWithIds() : context.listWithIds(API.listLength.long);
			Promise.resolve()

				// Shorten any article URLs
				.then(function() {
					if (type === 'articles') {
						return Promise.all(items.map(function(item) {
							if ('shorturl' in item[0]) {
								return item;
							}

							if (! item[0].url) { // having no url field is bad but not fatal
								return item;
							}

							if (/on\.ft\.com/.test(item[0].url)) { // handle previous bad behaviour by alert.js which was overwriting url with the value of shorturl
								item[0].shorturl = item[0].url;
								return item;
							}

							return API.shorturls.shorten(item[0].url).then(function(shorturl) {
								item[0].shorturl = shorturl;
								return item;
							});
						}));
					} else {
						return items;
					}
				})
				.then(function(items) {
					if (items.length > 0) {
						res.send("Last "+items.length+" "+type+" mentioned:\n" + numbers(items, formatters[type]) + '\nSay `'+type+' clear` to clear this list.');
					} else {
						res.send('No '+type+' have been mentioned in this channel in the last '+sessionLengthHours+' hours');
					}
				})
			;
		}
	});

	robot.respond(/lists\s+tidyup(?:\s+(force))?/, tidyup);

	setInterval(tidyup, tidyUpInterval);
};
