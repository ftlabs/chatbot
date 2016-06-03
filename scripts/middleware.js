// Description:
//   Allows messages to signal that they will not be responded to any more.

'use strict';

const hubot = require('hubot');

module.exports = function (robot) {

	const oldFinish = hubot.Message.prototype.finish;

	hubot.Message.prototype.addEventListener = function (type, fn) {
		if (!this._listeners) this._listeners = {};
		if (!this._listeners[type]) this._listeners[type] = new Set();
		this._listeners[type].add(fn);
	};

	hubot.Message.prototype.removeEventListener = function (type, fn) {
		if (!this._listeners) return;
		if (!this._listeners[type]) return;
		this._listeners[type].delete(fn);
	};

	hubot.Message.prototype.once = function (type, fn) {
		this.addEventListener(type, function self(details) {
			this.removeEventListener(type, self);
			fn(details);
		});
	};

	hubot.Message.prototype.emit = function (type, details) {
		if (this._listeners && this._listeners[type]) {
			this._listeners[type].forEach(fn => fn.bind(this)(details));
		}
	};

	hubot.Message.prototype.finish = function finish() {
		if (this.done) return;
		oldFinish.call(this);
		this.emit('finish');
	};

	robot.receiveMiddleware(function(context, next, done) {
		next(done);
	});

};