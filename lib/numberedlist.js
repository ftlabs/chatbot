module.exports = function(list, formatter) {
	return list.map(function(pair) {
		// pair = ["thing1", 5]
		var name = formatter ? formatter(pair[0]) : pair[0];
		return '  `' + pair[1] + '` '+ name;
	}).join('\n');
};