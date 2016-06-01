/**
 * Follow
 *
 * Save topic tags against a user account and retrieve latest stories
 *
 * Hosted:       Heroku
 * Status:       Part of Next FT's SOA
 * Docs:         None
 * Quality:      Reasonably modern standards but buggy and poorly tested
 */

var env = require('./utils/env')(['USER_PREFS_API_KEY']);

var urlpre = 'http://ft-next-api-user-prefs-v002.herokuapp.com';
var rb = new (require('./utils/requestbuilder'))({
	global: {
		json: true,
		headers: {
			"X-Api-Key": env.USER_PREFS_API_KEY
		}
	},
	byType: {
		list: {
			url: urlpre + '/activities/User:chatbot-%s/followed' // userId
		},
		follow: {
			method: 'PUT',
			url: urlpre + '/activities/User:chatbot-%s/followed/Topic:%s' // userId, ontology:name
		},
		unfollow: {
			method: 'DELETE',
			url: urlpre + '/activities/User:chatbot-%s/followed/Topic:%s' // userId, ontology:name
		},
		alerts: {
			url: urlpre + '/events/User:chatbot-%s/articleFromFollow/getSinceDate/-24h' // userId, interval (only hours work)
		}
	}
});

// Next FT seems to choke on user IDs containing slashes
function nextifyString(str) {
	return str.replace(/[\/\.\@]/g, '-');
}

// Next FT requires topics to be double encoded
// and requires the name component to be double-quoted
function encodeTopic(topic) {
	var topicSegments = topic.split(':');
	var ontology      = topicSegments[0];
	var name          = topicSegments[1].replace(/^\"(.*)\"$/, '$1');
	return ontology + ':' + '"' + encodeURIComponent(name) + '"'; // pre-adding the speechmarks around the name
}

// Next FT returns the topic sometimes with and sometimes without name wrapped in speechmarks
function decodeTopic(topic) {
	var topicSegments = decodeURIComponent(topic).split(':');
	var ontology      = topicSegments[0];
	var name          = topicSegments[1].replace(/^\"(.*)\"$/, '$1');
	return ontology + ':' + name;
}

module.exports = {
	list: function(userId) {
		return rb.request('list', {
			urldata: [nextifyString(userId)]
		})
		.then(function(data) {
			if (data && data.Items) {
				return data.Items.map(function(obj) {
					return decodeTopic(obj.UUID);
				});
			} else {
				return [];
			}
		});
	},
	start: function(userId, topic) {
		return rb.request('follow', {
			urldata: [nextifyString(userId), encodeTopic(topic)]
		})
		.then(function() { return topic; });
	},
	stop: function(userId, topic) {
		return rb.request('unfollow', {
			urldata: [nextifyString(userId), encodeTopic(topic)]
		})
		.then(function() { return topic; });
	},
	getAlerts: function(userId, age) {
		return rb.request('alerts', {
			urldata: [nextifyString(userId)]
		})
		.then(function(data) {
			return data.Items.map(function(item) {
				return item.UUID;
			});
		});
	}

};
