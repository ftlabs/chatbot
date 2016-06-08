/**
 * Content
 *
 * Get data on FT offers
 *
 * Hosted:       FT Membership
 * Status:       Part of Membership API
 * Docs:         http://git.svc.ft.com/projects/OM/repos/offer-api/browse/offer-api-gw.yaml
 * Quality:      Stable
 */

const env = require('./utils/env')(['OFFERS_API_KEY']);

const rb = new (require('./utils/requestbuilder'))({
	global: {
		json: true,
		headers: {
			"X-Api-Key": env.OFFERS_API_KEY
		},
		url: 'https://offer-api-gw-eu-west-1-test.memb.ft.com/offers/f5203c83-e824-523d-5ef2-766c162f8eba'
	}
});


module.exports = {
	getOffers: function(countryCode, frequency) {

		let options = {
			qs: {}
		};

		if (countryCode !== 'all') {
			options.qs.countryCode = countryCode;
		}

		return rb.request(options).then(function(data) {
			console.log(data);
			return {
				offers: data.offer.pricing,
				frequency: frequency
			};
		}).catch(function(err) {
			console.log('Offers API error', err);
			return null;
		});
	}
};
