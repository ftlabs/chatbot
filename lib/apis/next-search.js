/**
 * Search
 *
 * Find FT stories using ElasticSearch
 *
 * Hosted:       AWS
 * Status:       Part of Next FT's SOA
 * Docs:         None
 * Quality:      Seems OK but we've no idea what any of the boilerplate does
 */

const signedFetch = require('signed-aws-es-fetch');

var shortenAPI = require('./bitly');
var env = require('./utils/env')(['ELASTIC_SEARCH_KEY']);

var ftcampValue = 'engage/extensions/chat_poc_hubot/chat/chatbot/ftlabs';
var ftcampParam = '?ftcamp=' + ftcampValue;

var rb = new (require('./utils/requestbuilder'))({
	global: {
		url: 'http://next-elastic.ft.com/v3_api_v2/item/_search',
		method: 'POST',
		json: true,
		body: {
			from: 0,
			size: 4,
			highlight: { fields : { "item.title.title" : {} } },
			sort: [ { "item.lifecycle.lastPublishDateTime": { order: "desc" } } ]
		}
	},
	byType: {
		byText: {
			body: {
				query: { filtered: { query: { multi_match: { fields: ["item.body.body", "item.title.title^5"] }}}}
			}
		}
	}
});

function transformResults(data) {

	console.log('\n\n\nTHE DATA');
	console.log(data);

	if (data && data.hits && data.hits.hits) {
		return data.hits.hits.map(function(obj) {
			var src = obj._source.item;
			var ret = {
				uuid: src.id
			};
			if (src.title && src.title.title) {
				ret.title = src.title.title.trim();
			}
			if (src.location && src.location.uri) {
				ret.url = src.location.uri.trim() + ftcampParam;
			}
			if (src.editorial && src.editorial.byline) {
				ret.byline = src.editorial.byline.trim();
			}
			if (src.body && src.body.body) {
				ret.body = src.body.body.trim();
			}
			if (src.lifecycle && src.lifecycle.lastPublishDateTime) {
				ret.lastPublishDateTime = src.lifecycle.lastPublishDateTime.trim();
			}
			if (src.summary && src.summary.excerpt) {
				ret.excerpt = src.summary.excerpt.trim();
			}

			if (src.metadata) {
				var tagTerms = []; // to hold the full terms, including id
				var tags     = []; // to hold the concatenated ontology:name

				['primaryTheme', 'primarySection'].map(function(primaryWhat){
					if (src.metadata[primaryWhat] && src.metadata[primaryWhat]['term']) {
						var term = src.metadata[primaryWhat]['term'];
						term['primary'] = primaryWhat;
						tagTerms.push(term);
						var tag = term.taxonomy.trim() + ':' + term.name.trim();
						tags.push(tag);
					}
				});

				['people', 'organisations', 'sections', 'regions', 'topics'].map(function(tagType){
					var tagDataList = src.metadata[tagType];
					if (tagDataList.length>0) {
						tagDataList.map(function(tagData){
							var term = tagData['term'];
							if (term) {
								tagTerms.push(term);
								var tag = term.taxonomy.trim() + ':' + term.name.trim();
								if (tags.indexOf(tag) === -1) { // only add unique tags (i.e. not already added via primarySection etc)
									tags.push(tag);
								}
							}
						});
					}
				});

				ret.tagTerms = tagTerms;
				ret.tags     = tags;
			}

			return ret;
		});
	} else {
		return [];
	}
}

module.exports = {

	/**
	 * byTag
	 *
	 * Fetch stories tagged with a metadata term
	 *
	 * @param tag string Metadata term in the form <ontology>:<termName>
	 * @return array Array of stories
	 */
	byTag: function(tag) {
		var tagSegments = tag.split(':');
		var ontology = tagSegments[0];
		var name = tagSegments[1];
		var termObj = {};
		termObj['item.metadata.'+ontology+'.term.name'] = name;

		return rb.request('byTag', {
			body: {

				// query.filtered.filter.term object:
				// key contains ontology (e.g. sections, people, ...), value = tag name (e.g. china, angela merkel)
				// eg. { "item.metadata.%s.term.name": "%s" } (see elasticQueryTagFilterTerm)
				query: { filtered: { filter: { term: termObj }}}
			}
		})
		.then(transformResults);
	},

	/**
	 * byText
	 *
	 * Find stories containing a keyword in the title or body text
	 *
	 * @param queryStr string String to search for
	 * @return array Array of stories
	 */
	byText: function(queryStr) {

		let body = {
			query: { filtered: { query: { multi_match: { query: queryStr }}}}
		};

		body = {
			'query': {
				'filtered': {
					'query': {
						'multi_match': {
							'query': 'Brexit',
							'fields': ['item.body.body', 'item.title.title']
						}
					}
				}
			}
		};

		signedFetch('https://next-elastic.ft.com/v3_api_v2/item/_search', {
			method: 'POST',
			body: JSON.stringify(body)
		})
		.then(function(response) {
			return response.json();
		})
		.then(transformResults);
	},

	/**
	 * byText
	 *
	 * Find stories containing a keyword in the title or body text
	 *
	 * @param queryStr string String to search for
	 * @return array Array of stories
	 */
	byText_old: function(queryStr) {
		return rb.request('byText', {
			body: {
				query: { filtered: { query: { multi_match: { query: queryStr }}}}
			}
		})
		.then(transformResults);
	}
};
