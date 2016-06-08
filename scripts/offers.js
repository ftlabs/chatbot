// Description:
//
// Commands:

'use strict';
const API = require("../lib/apis/offersapi");

module.exports = function (robot) {

	robot.respond(/offers(?:\s+(.*))?/i, function (res) {

		console.log('offers query', API);

		const type = res.match[1];

		if (!type) {
			res.send('You need to specify a type, e.g. offers trial');
			return;
		} else {

			res = require('../lib/autolog')(res); // Log the query to the database
			// res = require('../lib/progressfeedback')(res);	// Pricing can take a while, so mix in progress feedback behaviour
			return API.getOffers()
				.then(function(price) {
					res.send(price);
				})
				.catch(function(e) {
					console.log(e);
					res.send('Unable to display offers');
				});
		}
	});
};
