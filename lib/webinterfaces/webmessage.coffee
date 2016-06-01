
Hubot = require 'hubot'
TextMessage = Hubot.TextMessage

###
 * A message represents an incoming message from a user
 * A message maybe assigned to many Responses
 * send/dm are non-standard on messages since the
 * Response object normally would contact the adapter
 * to handle sending of messages, the WebMessage
 * handles these itself allowing an existing adapter
 * to also have web based endpoints for interacting
###
class WebMessage extends TextMessage

	# Represents an incoming message from the web.
	#
	# user - A User instance that sent the message.
	# text - A String message.
	# id   - A String of the message ID.
	# res  - http response object through which to reply
	constructor: (@user, @text, @id, @res) ->
		super @user, @text, @id

	# Send replies back to the channel
	send: (message) =>
		@res.send(message)

	# Dm the user, or dm reply to the message sender 
	dm: (message, user) =>
		@res.send(message)

module.exports = WebMessage