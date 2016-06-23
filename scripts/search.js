// Description:
//   Provides price information for companies from global stock exchanges
//
// Commands:
//   hubot search <string> - Displays latest articles for topics matching your search (either a topic number, name, or free text).
//   hubot article <id> - Displays details of the specified article, e.g. article A2
//   hubot A<id> - Displays details of the specified article, e.g. A2

// NB, some topics commands are handled by contextmanager

'use strict';

const API = require("../lib/ftapis");
const numbers = require('../lib/numberedlist');
const moment = require('moment');

const articleFormatter = function(obj) {
	const pub = moment(obj.lastPublishDateTime).fromNow();
	const url = ('shorturl' in obj)? obj.shorturl : obj.url;
	return obj.title + ', _published ' + pub + '_ (' + url + ')';
};

const articleFullerFormatter = function(obj) {
	const pub = moment(obj.lastPublishDateTime).fromNow();
	const url = obj.shorturl || obj.url;
	const excerpt = obj.excerpt || '';
	return "*" + obj.title + '*\n' + url + ', _published ' + pub + '_\n' + excerpt;
};

const articleIdentifier = function(obj) { return obj.uuid; };

const shortenArticlesUrl = function(articles) {
	return articles.map(function(obj) {
		if ('shorturl' in obj) {
			return obj;
		} else {
			return API.shorturls.shorten(obj.url).then(function(shorturl) {
				obj.shorturl = shorturl;
				return obj;
			});
		}
	});
};

const handleSearch = function(res, term) {

	if (!term) { // either get term as a parm, or read it from res
		term = res.match[2];
	}

	const storyContext = require('../lib/scopedlist').getStoryContext(res);

	// Log the query to the database
	res = require('../lib/autolog')(res);

	let termIsaTopic = false;
	const termIsaSymbol = false;
	const expandedTopicName = '';

	if(! term) {
		res.send('You need to specify a word or phrase to search for, or a topic id, e.g. search bear market, or search T2');
		res.finish();
		return;
	} else if (/^\w{2,5}\:\w{3}$/.test(term)) {
		termIsaSymbol = true;
	} else if (/^(organisations|topics|people|regions):.+$/.test(term)) {
		termIsaTopic = true;
	}

	Promise.resolve()
		.then(function() {
			if (termIsaSymbol) {
				return API.pricing.getSecurityInfo(term).then(function(company) {
					term = company.basic.name;
					return term;
				}).catch(function() {
					return term;
				});
			} else {
				return term;
			}
		})
		.then(function(queryStr) {
			return (termIsaTopic ? API.search.byTag(queryStr) : API.search.byText(queryStr));
		})
		.then(function(articles) {
			return Promise.all(shortenArticlesUrl(articles));
		})
		.then(function(articles) {
			if (articles.length) {
				res.send('Latest articles for *' + term + '*' + expandedTopicName + ":\n" + numbers(storyContext.add(articles, articleIdentifier), articleFormatter) );
			} else {
				res.send('No articles found for *' + term + '*' + expandedTopicName + '.  Try a topic, or the name of a company, industry or person.');
			}
		})
		.catch(function(err) {
			res.send('Unable to load results for *' + term + '*');
			res.finish();
			console.log(err, err.stack);
		})
	;
};


module.exports = function (robot) {

	robot.respond(/(latest|search)$/i, function(res){
		res = require('../lib/autolog')(res);
		const mode = res.match[1];
		res.send('You need to specify a search term e.g. ' + mode + ' collapse');
		res.finish();
	});

	robot.respond(/(latest|search)\s+(.*)$/i, handleSearch );

	robot.respond(/(article|A)$/i, function(res){
		res = require('../lib/autolog')(res);
		res.send('You need to specify an article, e.g. article A3, or A3');
		res.finish();
	});

	robot.respond(/(?:article\s+A?|A)\s*(\d+)/i, function (res) {
		res = require('../lib/autolog')(res);
		const storyContext = require('../lib/scopedlist').getStoryContext(res);
		const term = res.match[1];
		const	article = storyContext.get(term);

		if (!article) {
			res.send('Could not identify an article from *' + term + '*');
		} else {
			res.send(articleFullerFormatter(article));
		}

		res.finish();
	});
};
