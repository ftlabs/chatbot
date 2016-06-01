
module.exports = function(requiredKeys) {

	var env = {};
	requiredKeys.forEach(function(keyName) {
		var val = process.env[keyName];
		if (!val) {
			console.log('Missing ENV var: ' + keyName);
		} else {
			env[keyName] = val;
		}
	});
	return env;
};
