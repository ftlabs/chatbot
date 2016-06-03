'use strict';

const nock = require('nock');
module.exports.cleanAll = function cleanAll() {
	nock.cleanAll();
}
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
}
