
var API = {};

API.pricing = require('./apis/miod');
API.shorturls = require('./apis/bitly');
API.share = require('./apis/emailthis');
API.primaryThemes = require('./apis/slurp');
API.topicsuggest = require('./apis/next-topicsuggest');
API.search = require('./apis/next-search');
API.follow = require('./apis/next-follow');
API.content = require('./apis/capi');

API.listLength = {
	short:  4,
	long:  20
};

module.exports = API;
