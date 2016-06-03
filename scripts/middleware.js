// Description:
//   Allows messages to signal that they will not be responded to any more.

'use strict';

const hubot = require('hubot');

module.exports = function (robot) {

	const oldFinish = hubot.Message.prototype.finish;

	hubot.Message.prototype.addEventListener = function (type, fn) {
		if (!this._listeners) this._listeners = {};
		if (!this._listeners[type]) this._listeners[type] = [];
		this._listeners[type].push(fn);
	}

	hubot.Message.prototype.finish = function finish() {
		if (this.done) return;
		oldFinish.call(this);
		if (this._listeners && this._listeners.finish) {
			this._listeners.finish.forEach(fn => fn.bind(this)());
		}
	};

	robot.receiveMiddleware(function(context, next, done) {
		next(done);
	});

};