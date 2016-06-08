// Description:
//
// Commands:

'use strict';
const API = require("../lib/apis/offersapi");

const SYMBOL = {
	gbp: '£',
	usd: '$',
	jpy: '¥',
	eur: '€',
	aud: 'A$',
	sgd: 'S$',
	hkd: 'HK$'
};

const COUNTRIES = {
	gbr: 'the UK',
	usa: 'the US'
	// TODO
};

module.exports = function (robot) {

	robot.respond(/(?:(.*)\s)?offers(?:\s+(.*))?/i, function (res) {

		const frequency = res.match[1];
		const countryCode = res.match[2] ? res.match[2].toUpperCase() : null;
		const seenValues = {};

		if (!countryCode && !frequency) {
			res.send('You need to specify a country code, e.g. Monthly offers GBR or All offers USA');
			return;
		} else {

			res = require('../lib/autolog')(res); // Log the query to the database
			res = require('../lib/progressfeedback')(res);
			return API.getOffers(countryCode, frequency)
				.then(function(data) {

					let offers = data.offers;

					let result;

					for (const keyOffer in offers) {
						if (offers.hasOwnProperty(keyOffer)) {
							let charges = offers[keyOffer].charges;

							for (const keyCharge in charges) {
								if (charges.hasOwnProperty(keyCharge)) {

									const frequency = charges[keyCharge].billingFrequency.displayName;
									const country = COUNTRIES[offers[keyOffer].country.toLowerCase()];
									const symbol = SYMBOL[charges[keyCharge].amount.symbol.toLowerCase()] || charges[keyCharge.toLowerCase()].amount.symbol;
									const value = charges[keyCharge].amount.value;

									if (data.frequency.toLowerCase() !== 'all' && data.frequency.toLowerCase() !== frequency.toLowerCase()) {
										continue;
									}


									let thisCharge;

									if (!seenValues[value]) {
										thisCharge = `*${frequency}* price in ${country} is *${symbol}${value}*`;
										seenValues[value] = true;
										result = result ? `${result}\n${thisCharge}` : thisCharge;
									}
								}
							}
						}
					}

					const response = result;;

					res.send(response);
				})
				.catch(function(e) {
					res.send('Unable to display offers');
				});
		}
	});
};
