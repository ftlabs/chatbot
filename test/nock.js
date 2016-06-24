'use strict';

const nock = require('nock');
const fullOffer = require('./fulloffer.json');

module.exports.cleanAll = function cleanAll() {
	nock.cleanAll();
};

module.exports.recommend = function recommendNock() {
	nock('http://markets.ft.com/')
	.get('/research/webservices/securities/v1/search')
	.query(true)
	.reply(200, {
		"data": {
			"searchResults": [
				{
					"symbol": "AAPL:NSQ",
					"name": "Apple Inc",
					"exchange": "Consolidated Issue Listed on NASDAQ Global Select ",
					"exhangeCode": "NSQ",
					"currency": "USD"
				},
				{
					"symbol": "0R2V:LSE",
					"name": "Apple Inc",
					"exchange": "London Stock Exchange",
					"exhangeCode": "LSE",
					"currency": "CHF"
				},
				{
					"symbol": "APGN:LSE",
					"name": "Applegreen PLC",
					"exchange": "London Stock Exchange",
					"exhangeCode": "LSE",
					"currency": "GBp"
				},
				{
					"symbol": "APLE:NYQ",
					"name": "Apple Hospitality REIT Inc",
					"exchange": "New York Consolidated",
					"exhangeCode": "NYQ",
					"currency": "USD"
				}
			]
		},
		"timeGenerated": "2016-06-02T22:44:38"
	});

	nock('http://markets.ft.com/')
	.get('/research/webservices/securities/v1/consensus-recommendations')
	.query(true)
	.reply(200, {
		"data": {
			"items": [
				{
					"symbolInput": "AAPL:NSQ",
					"basic": {
						"symbol": "AAPL:NSQ",
						"name": "Apple Inc",
						"exchange": "Consolidated Issue Listed on NASDAQ Global Select ",
						"exhangeCode": "NSQ",
						"currency": "USD"
					},
					"consensus": {
						"smartText": "As of May 27, 2016, the consensus forecast amongst 51 polled investment analysts covering Apple Inc. advises that the company will outperform the market. This has been the consensus forecast since the sentiment of investment analysts deteriorated on Sep 29, 2011. The previous consensus forecast advised investors to purchase equity in Apple Inc..",
						"consensus": [
							{
								"buy": 20,
								"outperform": 20,
								"hold": 11,
								"underperform": 0,
								"sell": 0,
								"noOpinion": 0,
								"date": "2016-06-02T00:00:00"
							},
							{
								"buy": 19,
								"outperform": 19,
								"hold": 12,
								"underperform": 0,
								"sell": 0,
								"noOpinion": 0,
								"date": "2016-05-05T00:00:00"
							},
							{
								"buy": 21,
								"outperform": 19,
								"hold": 11,
								"underperform": 0,
								"sell": 0,
								"noOpinion": 0,
								"date": "2016-04-07T00:00:00"
							},
							{
								"buy": 20,
								"outperform": 20,
								"hold": 12,
								"underperform": 0,
								"sell": 0,
								"noOpinion": 0,
								"date": "2016-03-10T00:00:00"
							},
							{
								"buy": 21,
								"outperform": 19,
								"hold": 15,
								"underperform": 0,
								"sell": 1,
								"noOpinion": 0,
								"date": "2015-06-02T00:00:00"
							}
						]
					}
				}
			]
		},
		"timeGenerated": "2016-06-02T22:44:39"
	});
};

module.exports.cost = function costNock(type, country) {

	let countryCode = country;
	let symbol = {
		CAN: '$',
		AUS: 'A$',
		JPN: '¥',
		ESP: '€',
		GBR: '£'
	};

	const OFFERS = {
		PREMIUM: '713f1e28-0bc5-8261-f1e6-eebab6f7600e',
		STANDARD: 'c8ad55e6-ba74-fea0-f9da-a4546ae2ee23',
		TRIAL: '41218b9e-c8ae-c934-43ad-71b13fcb4465'
	};

	const offerId = type === 'standard' ? OFFERS.STANDARD :
					type === 'trial' ? OFFERS.TRIAL :
					OFFERS.PREMIUM;

	nock('https://offer-api-gw-eu-west-1-prod.memb.ft.com/')
	.get(`/offers/${offerId}`)
	.query(true)
	.reply(200, {
		"offer":{
			"id":"713f1e28-0bc5-8261-f1e6-eebab6f7600e",
			"name":"FT.com Premium - RRP",
			"href":"/membership/offers/v1/713f1e28-0bc5-8261-f1e6-eebab6f7600e",
			"type":"RRP",
			"product":{
				"name":"Premium FT.com"
			},
			"restrictions":{
				"countries":[],
				"billingFrequency":[
					{
						"unit":"month",
						"value":1,
						"displayName":"Monthly",
						"iso8601Duration":"P1M"
					},
					{
						"unit":"month",
						"value":12,
						"displayName":"Annual",
						"iso8601Duration":"P1Y"
					}
				],
				"subscriptionTerms":[
					{
						"displayName":"Monthly",
						"iso8601Duration":"P1M"
					},
					{
						"displayName":"Annual",
						"iso8601Duration":"P1Y"
					}
				]
			},
			"pricing":[
				{
					"country":"CAN",
					"ratePlanId":"2c92a0fb405c5f37014078873b9c2996",
					"currency":"USD",
					"charges":[
						{
							"id":"2c92a0fb405c5f37014078873bcb2998",
							"name":"P2-Monthly-A97",
							"basis":"RECURRING",
							"billingFrequency":{
								"unit":"month",
								"value":1,
								"displayName":"Monthly",
								"iso8601Duration":"P1M"
							},
							"subscriptionTerm":{
								"displayName":"Monthly",
								"iso8601Duration":"P1M"
							},
							"amount":{
								"currency":"USD",
								"value":"56.50",
								"symbol":symbol[countryCode]
							}
						}
					]
				},
				{
					"country":countryCode,
					"ratePlanId":"2c92a0fb3f5ffc3d013f61ca45290d03",
					"currency":"USD",
					"charges":[
						{
							"id":"2c92a0fb3f5ffc3d013f61cc4d040ff0",
							"name":"P2-Annual-A97",
							"basis":"RECURRING",
							"billingFrequency":{
								"unit":"month",
								"value":12,
								"displayName":"Annual",
								"iso8601Duration":"P1Y"
							},
							"subscriptionTerm":{
								"displayName":"Annual",
								"iso8601Duration":"P1Y"
							},
							"amount":{
								"currency":"USD",
								"value":"507.00",
								"symbol":symbol[countryCode]
							}
						}
					]
				}
			]
		},
		"timeGenerated": "2016-06-02T22:44:38"
	});
};

module.exports.allOffers = function costNock() {
	nock('https://offer-api-gw-eu-west-1-prod.memb.ft.com/')
	.get(`/offers/713f1e28-0bc5-8261-f1e6-eebab6f7600e`)
	.query(true)
	.reply(200, fullOffer);
};
