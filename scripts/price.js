// Description:
//   Provides price information for companies from global stock exchanges
//
// Commands:
//   hubot price <company> - Displays price for <company> (can be a name, organisation topic, ticker symbol or P/T ref)

var API = require("../lib/ftapis");
var numbers = require('../lib/numberedlist');

var priceDecorator = function(obj) { return (typeof obj === 'string') ? obj : "*"+obj.basic.name+"* ("+obj.basic.symbol+")"; };
var priceIdentifier = function(obj) { return obj.basic.symbol; };


module.exports = function (robot) {

	robot.respond(/price(?:\s+(.*))?$/i, function (res) {
		res = require('../lib/autolog')(res); // Log the query to the database
		var term = res.match[1];

		if (! term) {
			res.send('You need to specify a company name or ticker symbol, e.g. price apple, or price AAPL');
			return;
		} else {
			res = require('../lib/progressfeedback')(res);	// Pricing can take a while, so mix in progress feedback behaviour
			var termIsSymbol = false;
			var topicContext = require('../lib/scopedlist').getTopicContext(res);
			var priceContext = require('../lib/scopedlist').getPriceContext(res);

			var topicMatch = topicContext.get(term);
			var priceMatch = priceContext.get(term);

			// Lookup from context - either topic or pricing (P is optional for price context items)
			if (/^P?\d+$/i.test(term) && priceMatch && priceMatch.basic) {
				term = priceMatch.basic.symbol;
			} else if (/^T\d+$/i.test(term) && topicMatch) {
				if (topicMatch.indexOf('organisations:') !== 0) {
					return res.send(term + ' is not an organisation topic.  Organisation topics start with `organisations:`');
				}
				term = topicMatch;
			}

			term = term.replace(/^organisations:/, '');
			termIsSymbol = /^\w+\:\w{3}$/.test(term);

			(termIsSymbol ? Promise.resolve(term) : API.pricing.findSymbol(term))
				.then(API.pricing.findPrice)
				.then(function(company) {
					return API.pricing.getGraphImage(company.basic.symbol)
						.then(API.shorturls.shorten)
						.then(function(chart) {
							res.send(numbers(priceContext.add(company, priceIdentifier), priceDecorator) + " " + numberFormat(company.quote.lastPrice,2) + ", " + (company.quote.change1Day > 0 ? "\u25b2" : "\u25bc") + " " + numberFormat(company.quote.change1Day, 2) + (company.quote.volume ? ". Vol: " + numberFormat(company.quote.volume) : "") + ". Chart: " + chart);
						});
				})
				.catch(function(e) {
					res.send('Unable to provide pricing information for "'+term+'".');
					console.log(e);
				})
			;
		}
	});
};


function numberFormat(n, p) {
	p = p || 0;
	return n.toFixed(p).replace(/./g, function(c, i, a) {
		return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
	});
}
