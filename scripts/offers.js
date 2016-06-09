// Description:
//   Provides information on FT subscription offers
// Commands:
//   hubot currencies - What currencies do we support?
//   hubot countries - In what countries do we sell subscriptions?
//   hubot What's is the cost of <a | an> <annual | monthly | > <premium | standard | trial | > subscription in <country>?
//   hubot Can I purchase a <premium | standard | trial | > subscription in <country>?

'use strict';

const API = require('../lib/ftapis');

const CURRENCY = {
	gbp: {
		symbol: '£',
		name: 'Great British Pounds'
	},
	usd: {
		symbol: '$',
		name: 'US Dollars'
	},
	jpy: {
		symbol: '¥',
		name: 'Yen'
	},
	eur: {
		symbol: '€',
		name: 'Euros'
	},
	aud: {
		symbol: 'A$',
		name: 'Australian Dollars'
	},
	sgd: {
		symbol: 'S$',
		name: 'Singapore Dollars'
	},
	hkd: {
		symbol: 'HK$',
		name: 'Hong Kong Dollars'
	},
	chf: {
		symbol: 'CHF',
		name: 'Swiss Francs'
	}
};

const COUNTRIES = {
	gbr: 'the UK',
	usa: 'the US',
	aus: 'Australia',
	che: 'Switzerland',
	hkg: 'Hong Kong',
	jpn: 'Japan',
	sgp: 'Singapore'
};

const findKey = function (value, object) {
	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			if (value.toLowerCase() === object[key].toLowerCase()) {
				return key.toUpperCase();
			}
		}
	}
};

module.exports = function (robot) {

	robot.respond(/(?:w|W)hat(?:'|’)s the (?:price|cost) of (?:a|an)\s*(\s*|monthly|annual)\s*(\s*|premium|standard|trial)\s*subscription in(?:\s(.*))\?/i, function (res) {

		const frequency = res.match[1];
		const type = res.match[2];
		let country = res.match[3];
		let countryCode;
		let countryName;

		if (country.length > 3) {
			countryCode = findKey(country, COUNTRIES) || country;
			countryName = country;
		}
		else {
			countryCode = country;
			countryName = country;
		}

		return API.offers.getOffers(countryCode, type)
			.then(function (offers) {
				let result;

				for (const keyOffer in offers) {
					if (offers.hasOwnProperty(keyOffer)) {
						let charges = offers[keyOffer].charges;

						for (const keyCharge in charges) {
							if (charges.hasOwnProperty(keyCharge)) {
								const frequencyName = charges[keyCharge].billingFrequency ? charges[keyCharge].billingFrequency.displayName : '';
								const mappedCurrency = CURRENCY[charges[keyCharge].amount.symbol.toLowerCase()];
								const symbol = mappedCurrency ? mappedCurrency.symbol : charges[keyCharge.toLowerCase()].amount.symbol;
								const value = charges[keyCharge].amount.value;

								if (frequency.toLowerCase() !== '' && frequency.toLowerCase() !== frequencyName.toLowerCase()) {
									continue;
								}

								let thisCharge = `${type !== 'trial' ? `*${frequencyName}*` : ''} *${type || 'premium'}* subscriptions in ${countryName} cost *${symbol}${value}*`;
								result = result ? `${result}\n${thisCharge}` : thisCharge;

								// the API returns extra things for trial we don't need
								if (type === 'trial') {
									break;
								}
							}
						}
					}
				}

				res.send(result);
			})
			.catch(function (){
				const message = `It seems we don't have ${type} ${frequency} subscriptions in ${countryName}.`;

				if (country.length <= 3) {
					res.send(message);
				}
				else {
					res.send(message + `\nYou may want to try again with ${country}\'s *3-letter code* (i.e. CAN for Canada) http://www.nationsonline.org/oneworld/country_code_list.htm`);
				}
			});

	});

	robot.respond(/currencies/i, function (res) {

		const currencies = {};

		return API.offers.getOffers('all', null)
			.then(function (offers) {

				for (const keyOffer in offers) {
					if (offers.hasOwnProperty(keyOffer)) {
						const name = CURRENCY[offers[keyOffer].currency.toLowerCase()].name;

						if (currencies[name]) {
							currencies[name].push(offers[keyOffer].country);
						}
						else {
							currencies[name] = [];
						}
					}
				}
				const response = [];

				for (const currency in currencies) {
					if (currencies.hasOwnProperty(currency)) {
						const countryCount = currencies[currency].length;
						let text;

						if (countryCount === 1) {
							const countryName = currencies[currency][0];
							text = `*${currency}* in ${COUNTRIES[countryName.toLowerCase()]}`;
						}
						else {
							text = `*${currency}* in ${countryCount} countries`;
						}

						response.push(text);
					}
				}

				res.send(`We support:\n>${response.join('\n>')}`);
			})
			.catch(function () {
				res.send(res.random['I don\'t know', '¯\_(ツ)_/¯']);
			});
	});

	robot.respond(/countries\?/i, function (res) {

		const response = {};

		return API.offers.getOffers('all', null)
			.then(function (offers) {

				for (const keyOffer in offers) {
					if (offers.hasOwnProperty(keyOffer)) {
						response[offers[keyOffer].country] = true;
					}
				}

				res.send(`We sell subscriptions in: ${Object.keys(response).sort().join(', ')}`);
			})
			.catch(function () {
				res.send(res.random['I don\'t know', '¯\_(ツ)_/¯']);
			});
	});

	robot.respond(/(?:c|C)an I purchase a\s*(\s|premium|standard|trial)\s*subscription in(?:\s(.*))\?/i, function (res) {

		const type = res.match[1];
		const country = res.match[2];

		return API.offers.getOffers(country, type)
			.then(function () {
				res.send(res.random([
					'Yes',
					'Yup',
					'Yes, you can',
					'You bet!'
				]));
			})
			.catch(function () {
				res.send(res.random([
					'No',
					'Nope',
					`Sorry, not in ${country}.`
				]));
			});
	});
};
