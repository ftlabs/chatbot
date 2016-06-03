// Description:
//   Defines financial terms
//
// Commands:
//   hubot define <word-or-phrase> - Displays a definition of a financial term

var API = require("../lib/ftapis");
var numbers = require('../lib/numberedlist');


module.exports = function (robot) {

	robot.respond(/define(?:\s+(.*))?/i, function (res) {
		res = require('../lib/autolog')(res); // Log the query to the database
		var term = res.match[1];

		if (! term) {
			res.send('You need to specify a term or phrase, e.g. define leverage');
			res.finish();
			return;
		} else {
			var termContext = require('../lib/scopedlist').getDefinitionContext(res);

			API.pricing.define(term)
				.then(function(def) {
					var defstr = "*"+term+"*:   "+def;
					res.send(numbers(termContext.add(defstr)));
					res.finish();
				})
				.catch(function(e) {
					res.send('Unable to display definition for "'+term+'".');
					res.finish();
					console.log(e);
				})
			;
		}
	});
};
