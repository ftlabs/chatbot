// Description:
//   Provides analyst survey information for a specified symbol or company name
//
// Commands:
//   hubot recommend <company> - Displays analyst recommendations for <company> (can be a name or ticker symbol)

var API = require("../lib/ftapis");

module.exports = function (robot) {

	robot.respond(/recommend(?:\s+(.*))?/i, function (res) {
		res = require('../lib/autolog')(res); // Log the query to the database
		var term = res.match[1];

		if (! term) {
			res.send('You need to specify a company name, e.g. recommend apple');
			return;
		} else {
			API.pricing.findSymbol(term)
				.then(API.pricing.getConsensusRecommedations)
				.then(function(advice) {
					if (!advice.smartText) throw('No results for ' + term);
					res.send(advice.smartText);
				})
				.catch(function(e) {
					res.send('Unable to display analyst recommendations for "'+ term +'".');
					console.log(e);
				})
			;
		}
	});
};
