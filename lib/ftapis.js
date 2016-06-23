
var API = {};

API.pricing = require('./apis/miod');
API.shorturls = require('./apis/bitly');
API.share = require('./apis/emailthis');
API.primaryThemes = require('./apis/slurp');

// Disabled for now due to no longterm support
// API.topicsuggest = require('./apis/next-topicsuggest');
API.search = require('./apis/next-search');
API.content = require('./apis/capi');
API.offers = require('./apis/offersapi');

API.listLength = {
	short:  4,
	long:  20
};

module.exports = API;
