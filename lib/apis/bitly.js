/**
 * Bit.ly
 *
 * Shorten URLs
 *
 * Hosted:       Bitly
 * Status:       Active
 * Docs:         http://dev.bitly.com/links.html
 * Quality:      Good
 */

var env = require('./utils/env')(['BITLY_TOKEN']);

var rb = new (require('./utils/requestbuilder'))({
	global: {
		url: 'https://api-ssl.bitly.com/v3/shorten',
		qs: {
			access_token: env.BITLY_TOKEN
		},
		json: true
	}
});

module.exports = {
	shorten: function(longUrl) {
		var args = { longUrl:longUrl };

		// If URL is already using a shortened hostname, just return it
		if (/^https?:\/\/bit\.ly|on\.ft\.com/.test(longUrl)) return longUrl;

		return rb.request({ qs: args })
			.then(function(data) {
				if (! data.data ) {
					throw new Error("no data element returned by Bitly");
				} else if( !data.data.url ) {
					throw new Error("no url value returned by Bitly: status_code=" + data.status_code + ", status_txt=" + data.status_txt);
				}

				return data.data.url;
			})
			.catch(function(e) {
				console.warn(e);
				return longUrl;
			})
		;
	}
};
