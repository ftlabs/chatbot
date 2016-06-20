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

require('./bitly');
const signedFetch = require('signed-aws-es-fetch');
const ftcampValue = 'engage/extensions/chat_poc_hubot/chat/chatbot/ftlabs';
const ftcampParam = '?ftcamp=' + ftcampValue;

const rb = new (require('./utils/requestbuilder'))({
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
	if (data && data.hits && data.hits.hits) {
		return data.hits.hits.map(function(obj) {
			const src = obj.fields;
			const ret = {
				uuid: obj._id
			};

			// Not really sure why src.* are all arrays
			// Must be a better way than to toString or [0] them all...

			if (src.title) {
				ret.title = src.title.toString();
			}
			if (src.webUrl) {
				ret.url = src.webUrl.toString() + ftcampParam;
			}
			if (src.byline) {
				ret.byline = src.byline.toString();
			}
			if (src.bodyHTML) {
				ret.body = src.bodyHTML.toString();
			}
			if (src.publishedDate) {
				ret.lastPublishDateTime = src.publishedDate.toString();
			}
			if (src.summaries) {
				ret.excerpt = src.summaries[0];
			}

			// metadata looks very different now o.O
			// need to add it to the request
			if (src.metadata) {
				const tagTerms = []; // to hold the full terms, including id
				const tags     = []; // to hold the concatenated ontology:name

				['primaryTheme', 'primarySection'].map(function(primaryWhat){
					if (src.metadata[primaryWhat] && src.metadata[primaryWhat]['term']) {
						const term = src.metadata[primaryWhat]['term'];
						term['primary'] = primaryWhat;
						tagTerms.push(term);
						const tag = term.taxonomy.trim() + ':' + term.name.trim();
						tags.push(tag);
					}
				});

				['people', 'organisations', 'sections', 'regions', 'topics'].map(function(tagType){
					const tagDataList = src.metadata[tagType];
					if (tagDataList.length>0) {
						tagDataList.map(function(tagData){
							const term = tagData['term'];
							if (term) {
								tagTerms.push(term);
								const tag = term.taxonomy.trim() + ':' + term.name.trim();
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
		const tagSegments = tag.split(':');
		const ontology = tagSegments[0];
		const name = tagSegments[1];
		const termObj = {};
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
	 * Uses Next's elasticsearch
	 *
	 * SCHEMA HERE http://next-elastic.ft.com/v3_api_v2/item/_mapping
	 *
	 * @param queryStr string String to search for
	 * @return array Array of stories
	 */
	byText: function(queryStr) {

		let body = {
			// can't request metadata directly as it's a complex field. See schema.
			fields : ['title', 'webUrl', 'byline', 'bodyHTML', 'publishedDate', 'summaries'],
			from: 0,
			size: 4,
			highlight: { fields : { 'item.title' : {} } },
			sort: [ { 'item.publishedDate': { order: 'desc' } } ],
			query: {
				filtered: {
					query: {
						multi_match: {
							query: queryStr,
							fields: ['item.title']
						}
					}
				}
			}
		};

		return signedFetch('https://next-elastic.ft.com/v3_api_v2/item/_search', {
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
