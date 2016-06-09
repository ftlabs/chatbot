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

'use strict';

const env = require('./utils/env')(['OFFERS_API_KEY']);

const URL = 'https://offer-api-gw-eu-west-1-prod.memb.ft.com/offers/';

const OFFERS = {
	PREMIUM: '713f1e28-0bc5-8261-f1e6-eebab6f7600e',
	STANDARD: 'c8ad55e6-ba74-fea0-f9da-a4546ae2ee23',
	TRIAL: '41218b9e-c8ae-c934-43ad-71b13fcb4465'
};

const request = {
	global: {
		json: true,
		headers: {
			"X-Api-Key": env.OFFERS_API_KEY
		}
	}
};

module.exports = {

	getOffers: function(countryCode, type) {

		let options = {
			qs: {}
		};

		if (countryCode !== 'all') {
			options.qs.countryCode = countryCode;
		}

		const offerId = type === 'standard' ? OFFERS.STANDARD :
						type === 'trial' ? OFFERS.TRIAL :
						OFFERS.PREMIUM;

		request.global.url = URL + offerId;

		const rb = new (require('./utils/requestbuilder'))(request);

		return rb.request(options).then(function(data) {
			if (data.offer.pricing.length) {
				return data.offer.pricing;
			}
			throw Error('No pricing found');
		});
	}
};
