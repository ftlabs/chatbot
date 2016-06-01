var request = require('request-promise');
var env = require('./utils/env')(['SEARCH_SUGGESTIONS_API_URL']);

module.exports = {

	/**
	 * getSuggestions
	 *
	 * Search for tags that match a search term
	 *
	 * @param rawPhrase string Search keyword
	 * @return array Tags as an array of strings
	 */
	getSuggestions: function(rawPhrase) {
		return request({
			url: env.SEARCH_SUGGESTIONS_API_URL,
			qs: { q: rawPhrase },
			json: true
		})
		.then(function(data) {
			var weightedSuggestions = [];
			data.map(function(grouping) {
				grouping.tags.map(function(tag) {
					var fullTagName = [grouping.name, tag.name].join(':');
					weightedSuggestions.push({
						name: fullTagName,
						weight: tag.score
					});
				});
			});

			var sortedWeightedSuggestions = weightedSuggestions.sort(function(a,b){ return (b.weight - a.weight); });
			var sortedSuggestionNames = sortedWeightedSuggestions.map(function(obj) { return obj.name; });

			return sortedSuggestionNames;
		});
	}
};
