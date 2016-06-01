/*
 * Provides a reference to the Hubot brain which automatically scopes
 * all keys to the channel context of a specified conversation
 * NB: allows override of the user id with a string from an env var, UNIQUIFY_ADAPTER_NAME
 * (mainly so that can work on multiple command lines without clashing).
 */

module.exports = function(res) {

	var scope = (res.scope) ? res.scope : [
		process.env.UNIQUIFY_ADAPTER_NAME || 'default',
		res.robot.adapterName,
		res.message.user.room ? 'rooms'               : 'users',
		res.message.user.room ? res.message.user.room : res.message.user.id
	].join('/');

	return {
		get: function(key) { return res.robot.brain.get(scope+'/'+key); },
		set: function(key, val) { return res.robot.brain.set(scope+'/'+key, val); },
		get scope() { return scope; }
	};

};
