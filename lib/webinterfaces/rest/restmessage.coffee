
WebMessage = require('../webmessage')

class RestMessage extends WebMessage

	# Represents an incoming message from the web.
	#
	# user - A User instance that sent the message.
	# text - A String message.
	# id   - A String of the message ID.
	# res  - http response object through which to reply
	constructor: (@user, @text, @id, @res) ->
		super @user, @text, @id, @res
		@buffer = [];
	send: (message) =>
		@buffer.push(message);
	dm: (message) =>
		@buffer.push(message);
	finish: () =>
		super()
		@res.send(@buffer.join('\n'));

module.exports = RestMessage