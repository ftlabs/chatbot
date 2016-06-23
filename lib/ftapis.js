
'use strict';
const API = {};

API.pricing = require('./apis/miod');
API.shorturls = require('./apis/bitly');
API.share = require('./apis/emailthis');
API.primaryThemes = require('./apis/slurp');
API.search = require('./apis/next-search');
API.content = require('./apis/capi');
API.offers = require('./apis/offersapi');

API.listLength = {
	short:  4,
	long:  20
};

module.exports = API;
