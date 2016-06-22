var request = require('request-promise');
var env = require('./utils/env')(['EMAILTHIS_SECRET','EMAILTHIS_RECAPTCHA_KEY', 'SLICE_API_URL']);
var sliceSize = 4;

module.exports = {

	/**
	 * getPrimaryThemes100Days
	 *
	 * Fetch the most popular tags, either the top tag from each taxonomy, or the top
	 * five tags from the specified taxonomy, aggregated over the last 100 days.
	 *
	 * @param type string Taxonomy to filter by, one of 'people', 'orgs', 'regions', 'topics'
	 * @return array Tags as an array of strings
	 */
	getPrimaryThemes100Days: function(type) {
		return request({
			url: env.SLICE_API_URL + '/metadatums_freq/by_type/primaryTheme/by_type',
			json: true
		})
		.then(function(data) {
			var chosen = [];

			if (data && data.metadatums_freq_by_type_by_type && data.metadatums_freq_by_type_by_type.primaryTheme) {

				var themes = data.metadatums_freq_by_type_by_type.primaryTheme;
				if (type === 'orgs') type = 'organisations';

				if (type && themes[type]) {
					chosen = themes[type].slice(0,4);
				} else {
					chosen = [themes.topics[0], themes.organisations[0], themes.regions[0], themes.people[0]];
				}
			}

			return chosen.map(function(obj) { return obj[0]; });
		});
	},

	/**
	 * getPrimaryThemes100Days
	 *
	 * Fetch the most popular tags, either the top tag from each taxonomy, or the top
	 * five tags from the specified taxonomy, aggregated over the last 2 weeks (ish).
	 *
	 * @param type string Taxonomy to filter by, one of 'people', 'orgs', 'regions', 'topics'
	 * @return array Tags as an array of strings
	 */
	getPrimaryThemes1Week: function(type) {
		// get the list of known weeks, most recent last:env.SLICE_API_URL + /metadatums/by_type/week
		// choose the last (most recent) fullish week (weeks start on Sunday)
		// look up coocs for that week, by type
		// return the top few (filtered by flavour)

		return request({
			url: env.SLICE_API_URL + '/metadatums/by_type/week',
			json: true
		})
		.then(function(data) {
			var chosen = []; // to be returned

			if (data && data.metadatums_by_type && data.metadatums_by_type.week) {
				// work out if we need last week or 2nd last week (if today is mon/tue/weds)
				var date        = new Date();
				var dayOfWeek   = date.getDay();
				var indexOfWeek = (dayOfWeek > 2)? 1 : 2;
				var latestWeek  = data.metadatums_by_type.week[data.metadatums_by_type.week.length - indexOfWeek];

				return request({
					url: env.SLICE_API_URL + '/cooccurrences_as_counts/' + encodeURI(latestWeek) + '/by_type',
					json: true
				})
				.then(function(dataW) {
					if (dataW && dataW.cooccurrences_as_counts && dataW.cooccurrences_as_counts.primaryTheme) {
						var primaryThemesPairs = dataW.cooccurrences_as_counts.primaryTheme;
						var themesByOntology = {};
						var themes = primaryThemesPairs.map(function(pair){
							var segments = pair[0].split(':');
							var ontology = segments[1];
							var name     = segments[2];
							var theme    = ontology + ':' + name;

							if (! (ontology in themesByOntology)) {	themesByOntology[ontology] = []; }
							themesByOntology[ontology].push(theme);

							return theme;
						});

						if (type === 'orgs'){ type = 'organisations'; }
						if (type && themesByOntology[type]) {
							chosen = themesByOntology[type].slice(0,sliceSize);
						} else if (type) {
							// don't recognise the type
						} else {
							// ['topics', 'organisations', 'regions', 'people'].map(function(sampleType) {
							//	if(sampleType in themesByOntology) { chosen.push(themesByOntology[sampleType][0]); }
							// });
							chosen = themes.slice(0,sliceSize);
						}
					}

					return chosen;
				})
				.catch(e => {
					console.warn('Error in: slurp.js');
					console.warn(e);
					return chosen;
				});
			} else {
				return chosen;
			}
		});
	},

   /**
	 * getRelatedThemes
	 *
	 * Fetch the most related (cooccurring) tags.
	 *
	 * @return array Tags as an array of strings
	 */
	getRelatedThemes: function(topic) {
		return request({
			url: env.SLICE_API_URL + '/cooccurrences_as_counts/' + encodeURI(topic) + '/by_type',
			json: true
		})
		.then(function(data) {
			var chosen = [];

			if (data && data.cooccurrences_as_counts) {
				var coocs = data.cooccurrences_as_counts;
				['topics', 'organisations', 'regions', 'people'].map(function(ontology) {
					if( coocs[ontology] ) {
						var suggestion = coocs[ontology][0][0];
						if ((suggestion === topic) && (coocs[ontology].length > 1)) {
							suggestion = coocs[ontology][1][0];
						}
						chosen.push( suggestion );
					}
				});
			}

			return chosen;
		})
		.catch(function(err) {
			if(err) {
				var statusCode   = err.statusCode || 'unknown status code';
				var errorMessage = (err.error && err.error.message)? err.error.message : 'unknown error.message';

				console.log("WARNING: getRelatedThemes: topic=" + topic + ": statusCode=" + statusCode + ": " + errorMessage);
			} else {
				console.log("ERROR: getRelatedThemes: topic=" + topic + ": unknown err");
			}

			return null;
		});
	}
};
