WebMessage = require('./webmessage')

module.exports = (robot) ->

	###
	 * Allows the Response to detect whether the Message has come from
	 * a web endpoint or from the adapter. in the web case the WebMessage
	 * should handle replying itself. Otherwise pass it to the adapter
	 * like usual.
	###
	class NewResponse extends robot.Response
		constructor: (@robot, @message, @match) ->
			super @robot, @message, @match

			if @message instanceof WebMessage
				@send = (message) =>
					@message.send(message);

	return {
		Response: NewResponse
	}