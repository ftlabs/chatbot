/*
 * Stores lists in the brain.
 * The underlying list is a simple array.
 * The returned list (by the accessors 'add' and 'list') is an array of pairs, e.g. [['name1', 1], ['name2', 3]].
 * The second element of each pair is the displayable index of the pair, and could be prefixed with a letter, and therefore may not be an integer.
 * It is possible to look up a specific item in the list, via the accessor 'get', with an integer index or with the prefixed index.
 */

'use strict';

const prefixes = {
	articles: 'A',
	definitions: 'D',
	prices: 'P'
};

module.exports = function(res, key, indexPrefixStr) {

	const brain = require('./scopedbrain')(res);

	// A bit of clunkiness to have the index prefixed with a string, eg. 'A1', 'A2' etc for articles.
	// To make it clear what has been tweaked for index prefixing, the manuipulation functions are listed here,
	// and then used in some of the return functions.

	if (! indexPrefixStr) { indexPrefixStr = ''; }

	const indexRegex = indexPrefixStr === '' ? new RegExp('^(\\d+)') : RegExp('^' + indexPrefixStr + '?(\\d+)', 'i');

	const prefixIndex = function(idx) { return '' + indexPrefixStr + idx; };

	const unPrefixIndex = function(idx) {
		if (isNaN(idx)) {
			const m = idx.match(indexRegex);
			if (m !== null) {
				return parseInt(m[1], 10);
			} else {
				return -1;
			}
		} else {
			return idx;
		}
	};

	const prefixIndiciesInPairs = function(pairs) {
		return pairs.map(function(pair){
			return [pair[0], prefixIndex(pair[1])];
		});
	};

	// eof index prefixing clunkiness

	const list = function() {
		const arr = brain.get(key);
		if (arr !== null && typeof arr === 'object' && arr.data) arr = arr.data;
		return (arr && Array.isArray(arr)) ? arr : [];
	};

	const search = function(items, idFunc) {
		const arr = list();
		const listIds = idFunc ? arr.map(idFunc) : arr;
		return items.map( function(item) {
			const idx = listIds.indexOf(idFunc ? idFunc(item) : item);
			return [item, (idx === -1)? idx : idx + 1 ];
		});
	};

	const isValidIndex = function( term ) { // is an integer, or a string of an integer or a string of a prefixed integer
		return term && ((typeof term === 'number' && (term % 1)===0) || term.match(indexRegex)) !== null;
	};

	return {
		add: function(vals, idFunc) {
			if (! Array.isArray(vals)) {
				vals = [ vals ];
			}

			const arr = list();
			const existing = search(vals, idFunc);

			// If the item isn't found in the existing list, add it and fill in the index number
			const complete = existing.map(function(result) {
				const newResult = result;
				if (result[1] === -1) {
					newResult[1] = arr.length + 1;
					arr.push(result[0]);
				}
				return newResult;
			}).sort(function(x, y) {
				return x[1] < y[1] ? -1 : 1;
			});

			// We currently rely on this data structure outside of scopedlist - in contextmanager.js.  Ick.
			brain.set(key, {updatetime:(new Date()).getTime(), data: arr});
			return prefixIndiciesInPairs(complete);
		},
		get: function(idx) {
			return list()[unPrefixIndex(idx)-1];
		},
		clear: function() {
			brain.set(key, null);
		},
		list: list,
		listWithIds: function(limit) {
			limit = limit || 0;
			return prefixIndiciesInPairs(list().map(function(item,idx) {
				return [item, idx+1];
			})).slice(0-limit);
		},
		search: search,
		isValidIndex: isValidIndex,
		get length() {
			return list().length;
		},
		get indexPrefix() {
			return indexPrefixStr;
		}
	};
};

module.exports.getByType = function(res, type) {
	if (!(type in prefixes)) {
		throw new Error("Invalid context list type "+type+". Available types: "+ Object.keys(prefixes).join(','));
	}
	return module.exports(res, 'context/'+type, prefixes[type]);
};
module.exports.getTypes = function() { return Object.keys(prefixes); };

module.exports.getStoryContext = function(res) { return module.exports.getByType(res, 'articles'); };
module.exports.getDefinitionContext = function(res) { return module.exports.getByType(res, 'definitions'); };
module.exports.getPriceContext = function(res) { return module.exports.getByType(res, 'prices'); };
