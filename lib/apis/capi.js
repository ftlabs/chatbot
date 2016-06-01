/**
 * Content
 *
 * Get data on FT stories
 *
 * Hosted:       FT Platform
 * Status:       Part of Content API / Universal publishing
 * Docs:         http://developer.ft.com/docs/api_v1_reference/content_items#resource
 * Quality:      Decent
 */

var env = require('./utils/env')(['CAPI_API_KEY']);
var rb = new (require('./utils/requestbuilder'))({
	global: {
		json: true,
		headers: {
			"X-Api-Key": env.CAPI_API_KEY
		}
	},
	byType: {
		getContent: {
			url: 'http://api.ft.com/content/items/v1/%s'
		}
	}
});


module.exports = {
	getStory: function(uuid) { // NB: this could return null if the capi request fails
		return rb.request('getContent', {
			urldata: [ uuid ]
		}).then(function(data) {
			var src = data.item;
			var ret = {
				uuid: src.id
			};
			if (src.title && src.title.title) {
				ret.title = src.title.title.trim();
			}
			if (src.location && src.location.uri) {
				ret.url = src.location.uri.trim();
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
			if (src.metadata && src.metadata.tags) {
				ret.tags = src.metadata.tags.filter(function(obj) {

					// Some terms in CAPI appear to not have a name or taxonomy.  Some have neither!
					return obj.term && obj.term.name && obj.term.taxonomy;
				}).map(function(obj) {
					return obj.term.taxonomy.trim() + ':' + obj.term.name.trim();
				});
			}
			return ret;
		}).catch(function(err) {
			if(err) {
				var statusCode   = err.statusCode || 'unknown status code';
				var errorMessage = (err.error && err.error.message)? err.error.message : 'unknown error.message';

				console.log("WARNING: getStory: uuid=" + uuid + ": statusCode=" + statusCode + ": " + errorMessage);
			} else {
				console.log("ERROR: getStory: uuid=" + uuid + ": unknown err");
			}

			return null;
		});
	}
};
