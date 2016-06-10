// Description:
//   lets users follow topics, and alerts them when new articles are published
//
// Commands:
//   hubot follow <topic> - Follow this topic in the current channel (may also be a topic number)
//   hubot following - List the topics being followed in the current channel
//   hubot unfollow <topic> - Stop following the specified topic (may also be a topic number)
//   hubot unfollow all - Stop following all topics
//   hubot alerts on/off - Turn alerts on or off for all followed topics (allows you to temporarily stop alerts without hubot forgetting what you are following)

var pollInterval = 60000;
var API = require("../lib/ftapis");
var numbers = require('../lib/numberedlist');

function handleChat(mode, res) {
		var topicContext = require('../lib/scopedlist').getTopicContext(res);
		var scope = require('../lib/scopedbrain')(res).scope;
		var alertScopes = res.robot.brain.get('alertScopes') || [];
		var alertPos = alertScopes.indexOf(scope);
		var alertsAreOn = alertPos !== -1;

		// Log the query to the database
		res = require('../lib/autolog')(res);

		if (mode == 'following') {
			API.follow.list(scope).then(function(topics) {
				if (!topics.length) {
					res.send('Not currently following anything.  To start following a topic, say `follow <topicname>`');
				} else {
					var numberedItems = topicContext.add(topics);
					res.send('In this channel, you are following '+topics.length+' topic'+((topics.length>1)?'s':'')+':\n'+numbers(numberedItems));
					if (!alertsAreOn) {
						res.send('Alerts are currently off.  To turn on alerts for the topics you are following, say `alerts on`');
					}
				}
			});
		} else if (mode == 'unfollow' && res.match[2] == 'all') {
			// list all followed topics, then unfollow each one
			API.follow.list(scope).then(function(topics) {
				if (!topics.length) {
					res.send('Not currently following anything.  To start following a topic, say `follow <topicname>`');
				} else {
					topics.forEach(function(followedTopic) {
						API.follow.stop(scope, followedTopic).then(function(topicName) {
							res.send('Stopped following *'+topicName+'*');
						});
					});
				}
			});
		} else if (mode == 'follow' || mode == 'unfollow') {

			var topic = res.match[2];

			if(!topic) {
				res.send('You need to specify a topic, e.g. ' + mode + ' T3');
				return;
			} else if (topicContext.isValidIndex(topic)) {
				topic = topicContext.get(topic);
				if (!topic) {
					res.send('I don\'t know which topic you\'re referring to.  You can refer to a topic by number if it comes from a topic list');
					return;
				}
			} else if( ! topic.match(/^\w+:\w+.*\w$/)) {
				res.send('I don\'t recognise which topic you are referring to. It should be of the format type:name (e.g. regions:China) or a number if it comes from a topic list. Try entering "topics <name>" to get valid topics.');
				return;
			}

			if (mode === 'follow') {
				API.follow.start(scope, topic).then(function(topicName) {

					// TODO: What if the bot gets kicked out of a channel?  In that case you'd want to stop trying to send alerts to it
					res.send('Now following *'+topicName+'*.');
					if (!alertsAreOn) {
						res.send('Alerts are currently off.  To turn on alerts for the topics you are following, say `alerts on`');
					} else {
						res.send('I\'ll post a message in this channel for new matching stories.  To stop at any time say `unfollow '+topicName+'`.');
					}
				});
			} else {
				API.follow.stop(scope, topic).then(function(topicName) {
					res.send('Stopped following *'+topicName+'*');
				});
			}
		} else if (mode == 'alerts') {
			var action = res.match[2];

			if (action == 'on') {
				if (!alertsAreOn) {
					alertScopes.push(scope);
					res.robot.brain.set('alertScopes', alertScopes);
					res.send('Turned alerts on');
				} else {
					res.send('Alerts are already on');
					// res.send('(your username in the Next FT Prefs service is `'+ scope+'`)');
				}
			} else if (action === 'off') {
				if (!alertsAreOn) {
					res.send('Alerts are already off.  This setting is *channel specific*, so if you are getting unwanted alerts in another channel, try saying `alerts off` there instead');
				} else {
					alertScopes.splice(alertPos, 1);
					res.robot.brain.set('alertScopes', alertScopes);
					res.send('Turned alerts off');
				}
			} else if(action) {
				res.send('You need to specify either on or off, or leave it blank to see what the current state of alerts is.');
			} else {
				res.send('Alerts are currently ' + (alertsAreOn ? 'on' : 'off'));
			}
		}

}


module.exports = function(robot) {

	setInterval(poll, pollInterval);

	console.log("INFO: alert: pollInterval=" + pollInterval);
	// console.log("DEBUG: alert: robot=", robot);

	// NB: ensure the 1st arg is the 2nd match, ie include the initial term as the first match,
	// for consistency in the handleChat code (so that res.match[2] is always the arg)

	robot.respond(/(following)$/i, handleChat.bind(this, 'following'));
	robot.respond(/(follow|alert)(?:\s+(.*))?$/i, handleChat.bind(this, 'follow'));
	robot.respond(/(unfollow)(?:\s+(.*))?$/i, handleChat.bind(this, 'unfollow'));
	robot.respond(/(alerts)(?:\s+(on|off|\S.*))?$/i, handleChat.bind(this, 'alerts'));
	robot.respond(/alerts\s+poll$/i, poll.bind(this, 'all'));      // poll all users
	robot.respond(/alerts\s+pollme$/i, poll.bind(this, 'me'));       // poll just this user
	robot.respond(/alerts\s+pollmeforce$/i, poll.bind(this, 'meforce'));  // poll just this user, don't ignore previously alerted articles

	// Story numbering/formatting functions.  TODO: make these static properties of a Story class? duplicated in alerts, search, contextmanager
	var formatter = function(obj) {
		var url = ('shorturl' in obj)? obj.shorturl : obj.url;
		return obj.title + ' (' + url + ')';
	};
	var identifier = function(obj) { return obj.uuid; };

	function poll(mode, res) { // mode and res will be undefined when poll() is invoked offline
		var alertScopes = robot.brain.get('alertScopes');

		var ignoreHistory = (mode === 'meforce');
		if (mode === 'me' || mode === 'meforce') {
			alertScopes = [require('../lib/scopedbrain')(res).scope]; // just get the scope of this user
		}

		console.log("DEBUG: alert: poll: mode=", mode, ",\nalertScopes=", alertScopes, ",\nignoreHistory=", ignoreHistory);

		if (res) {
			console.log("DEBUG: alert: poll: res.envelope=", res.envelope);
		}

		if (!alertScopes) return;
		alertScopes.forEach(function(scope) {
			var scopeSplit = scope.split('/');
			var scopeNamespace = scopeSplit[0];
			var scopeAdapter = scopeSplit[1];
			var scopeType = scopeSplit[2];
			var scopeName = scopeSplit[3];
			var titlesWithURLs = [];
			var storyContext = require('../lib/scopedlist').getStoryContext({robot:robot, scope:scope});

			if (scopeAdapter !== robot.adapterName || !scopeName) return;

			function hasAlerted(uuid, set) {
				var key = scope+'/alerts/'+uuid;
				return (set) ? robot.brain.set(key, true) : robot.brain.get(key);
			}

			API.follow.getAlerts(scope)

			// Eliminate stories that have been alerted previously in this scope, unless we are ignoring history
			.then(function(uuids) {
				if (uuids.length) console.log('Alerts found: ',uuids.length, scope);
				return (ignoreHistory)? uuids : uuids.filter(function(uuid) {
					return !hasAlerted(uuid);
				});
			})

			// Retrieve full content
			.then(function(uuids) {
				return Promise.all(uuids.map(API.content.getStory));
			})

			// Shorten URLs
			.then(function(articles) {
				articles = articles.filter(function(obj){ return !!obj; }); // strip out any nulls (i.e. failed CAPI lookups)

				return Promise.all(articles.map(function(obj) {
					return API.shorturls.shorten(obj.url).then(function(shorturl) {
						obj.shorturl = shorturl;
						return obj;
					});
				}));
			})

			// Format and send
			.then(function(articles) {
				if (articles.length) {
					var destEnvelope = (scopeType === 'rooms') ? {room: scopeName} : {user:robot.brain.userForId(scopeName)};
					articles.forEach(function(story) { hasAlerted(story.uuid, true); });
					console.log('INFO: Sending alerts to scope=' + scope + ', destEnvelope=' + JSON.stringify(destEnvelope));
					robot.send(destEnvelope, articles.length+' new article'+((articles.length===1)?'':'s')+' from topics you follow:\n' + numbers(storyContext.add(articles, identifier), formatter));
				} else {
					console.log('INFO: not sending alerts to scope=' + scope);
				}
			});
		});
	}


};
