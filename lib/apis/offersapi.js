


/**
 * Content
 *
 * Get data on FT offers
 *
 * Hosted:       FT Membership
 * Status:       Part of Membership API
 * Docs:    	 https://sites.google.com/a/ft.com/membership-subscriptions/membership-api/offer-api/offer-api-endpoints
 * Quality:      Stable
 */


// curl -i -H "Content-Type: application/json" -H "x-api-key: 0qdchVfu2Bazrd06OYoZf9jyMugaxouG8kVM80Dz" "https://offer-api-gw-eu-west-1-test.memb.ft.com/offers/f5203c83-e824-523d-5ef2-766c162f8eba?countryCode=GBR"




// curl -i -H "Content-Type: application/json" -H "x-api-key: 0qdchVfu2Bazrd06OYoZf9jyMugaxouG8kVM80Dz" "https://offer-api-gw-eu-west-1-test.memb.ft.com/offers/f5203c83-e824-523d-5ef2-766c162f8eba?countryCode=GBR"

var env = require('./utils/env')(['OFFERS_API_KEY']);

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
	getOffers: function() { // NB: this could return null if the capi request fails
		return rb.request({
			qs: {countryCode:'GBR'}
		}).then(function(data) {
			// const src = data.item;
			console.log(data.offer.pricing[0].charges[0].amount.value);
			return data.offer.pricing[0].charges[0].amount.value + '';
		}).catch(function(err) {
			console.log('Offers API error', err);
			return null;
		});
	}
};
