/**
 * Pricing
 *
 * Retrieve prices for companies or stocks, generate stock price charts
 *
 * Hosted:       MIOD
 * Status:       Used by web app, considered current
 * Docs:         http://markets.ft.com/research/webservices/securities/v1/docs
 * Quality:      Decent, though note that chart image URLs are very slow
 */

var moment = require('moment');
var env = require('./utils/env')(['MARKETS_API_KEY']);
var rb = new (require('./utils/requestbuilder'))({
	global: {
		json: true,
		headers: { "X-FT-Source": env.MARKETS_API_KEY }
	},
	byType: {
		findSymbol: {
			url: 'http://markets.ft.com/research/webservices/securities/v1/search',
			qs: { exchanges: 'nsq,lse,nyq' }
		},
		findPrice: {
			url: 'http://markets.ft.com/research/webservices/securities/v1/quotes',
		},
		getSecurityInfo: {
			url: 'http://markets.ft.com/research/webservices/securities/v1/details',
		},
		getGraphImage: {
			url: 'http://apis.markets.ft.com/APIs/MarketsHomeChart/json',
			qs: { height: 100, width: 500, IsCurrency: "true" },
		},
		getConsensusRecommedations: {
			url: 'http://markets.ft.com/research/webservices/securities/v1/consensus-recommendations'
		},
		define: {
			url: 'http://markets.ft.com/research/webservices/lexicon/v1/terms',
			qs: { truncationCount: 1000 } // Forces response to be plain text and no longer than n chars
		}
	}
});

module.exports = {

	/**
	 * Returns best matching symbol for the symbol or name provided in query
	 * An exchange filter is hard coded into the query to improve result relevance
	 *
	 * @param query string Search keyword
	 * @return string The best symbol match
	 */
	findSymbol: function(query) {
		var args = { query: query };
		return rb.request('findSymbol', { qs: args })
			.then(function(results) {
				if (!results || !results.data || !results.data.searchResults) {
					throw new Error("No symbol match for name");
				}
				return results.data.searchResults[0].symbol;
			})
		;
	},

	/**
	 * Returns pricing information for a specified symbol, in a MIOD quote object
	 *
	 * @param symbol string Symbol of the stock to check
	 * @return object Object with `basic` and `quote` properties
	 */
	findPrice: function(symbol) {
		var args = { symbols: symbol };
		return rb.request('findPrice', { qs: args })
			.then(function(results) {
				if (!results.data || !results.data.items) throw new Error("No price match for symbol");
				return results.data.items[0];
			})
		;
	},

	/**
	 * Returns info about a security
	 *
	 * @param symbol string Symbol of the stock to check
	 * @return object Object with `basic` and `details` properties
	 */
	getSecurityInfo: function(symbol) {
		var args = { symbols: symbol };
		return rb.request('getSecurityInfo', { qs: args })
			.then(function(results) {
				if (!results.data || !results.data.items) throw new Error("No price match for symbol");
				return results.data.items[0];
			})
		;
	},

	/**
	 * Returns the URL of a graph image for the specified symbol, at 500x100px
	 *
	 * This is a bit of a hack agreed with Jeremy Redding at MIOD - this endpoint
	 * returns a dynamic image, but adding a v= argument makes it add a very long
	 * TTL to the cache-control header so that it sticks in the CDN for longer
	 * than people are going to want to look at it in chat.  When it expires, it
	 * will regenerate so will then no longer correspond to the price that
	 * accompanies it.
	 *
	 * @param symbol string Symbol of the stock to check
	 * @return object Object with `basic` and `quote` properties
	 */
	getGraphImage: function(symbol) {
		return Promise.resolve('http://content.markitqa.com/ft.wsodqa.com/data/Charts/TearsheetSummary?symbols='+symbol+'&height=100&width=500&v='+moment().format());
	},

	/**
	 * Returns the consensus of polled investment analysts regarding the potential
	 * future performance of a stock.
	 *
	 * @param symbol string Symbol of the stock to check
	 * @return object Object with `smartText` and `consensus` properties.
	 */
	getConsensusRecommedations: function(symbol) {
		var args = { symbols: symbol };
		return rb.request('getConsensusRecommedations', { qs: args })
			.then(function(results) {
				if (!results.data || !results.data.items) throw new Error("No recommendations available");
				return results.data.items[0].consensus;
			})
		;
	},

	/**
	 * Returns the Lexicon definition of a specified term
	 *
	 * @param symbol string Exact name of the lexicon term
	 * @return string Definition
	 */
	define: function(term) {
		return rb.request('define', { qs: { names: term } })
			.then(function(results) {
				if (!results.data || !results.data.items || results.data.items.length === 0) throw new Error("No definitions available");
				return results.data.items[0].definition;
			})
		;
	}
};
