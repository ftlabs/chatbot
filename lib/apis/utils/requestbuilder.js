var merge = require('lodash').merge;
var sprintf = require('util').format;
var request = require('request-promise');

module.exports = function(opts) {
	this.global = opts.global || {};
	this.requestTypes = opts.byType || {};

	this.request = function(template, opts) {
		if (typeof template === 'object' && !opts) {
			opts = template;
		}
		var config = merge({}, this.global, this.requestTypes[template], opts);
		if (config.urldata) {
			config.url = sprintf.apply(null, [config.url].concat(config.urldata.map(encodeURIComponent)));
			delete config.urldata;
		}
		console.log("Outbound HTTP request: ", config.url);
		return request(config)
		.catch(e => {
			console.warn('Error requesting: ', config.url);
			throw e;
		});
	};

};
