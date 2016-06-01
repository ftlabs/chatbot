/**
 * Email this
 *
 * Send FT stories to friends and colleagues by email
 *
 * Hosted:       Legacy FT Labs infrastructure
 * Status:       Deprecated, to be decomissioned
 * Docs:         Available only as the original Assanka tech spec
 * Quality:      Extremely poor
 */

var request = require('request-promise');
var env = require('./utils/env')(['EMAILTHIS_SECRET','EMAILTHIS_RECAPTCHA_KEY']);

function md5(str) {
	return require('crypto').createHash('md5').update(str).digest("hex");
}

module.exports = {
	send: function(recip, story) {

		var now = Math.round((new Date()).getTime()/1000);
		var sharedata = {
			url: story.url,
			template: "article",
			config: "1",
			data: {
				title: story.title,
				snippet: story.excerpt,
				url: story.url,
				date: story.lastPublishDateTime,
				byline: story.byline,
				source: "FT"
			},
			gentime: now
		};
		sharedata.sig = md5(JSON.stringify(sharedata)+env.EMAILTHIS_SECRET);

		return request({
			url: 'http://emailthis.t.ft.com/api/send',
			method: 'POST',
			form: {
				recipientemails: recip,
				useremail: "noreply@t.ft.com",
				articledata: JSON.stringify(sharedata),
				recaptchabypass: now+'-'+md5(now+env.EMAILTHIS_RECAPTCHA_KEY)
			}
		}).then(function(resp) {
			if (resp.indexOf('"success":true') !== -1) return true;
			if (resp.indexOf('"errorcode":"03"') !== -1) throw new Error('Invalid signature error from email-this API');
			return true;
		});
	}
};
