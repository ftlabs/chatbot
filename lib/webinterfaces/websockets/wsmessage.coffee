
request = require 'request-promise'
WebMessage = require('../webmessage')
moment = require('moment')

class WSMessage extends WebMessage

	constructor: (@user, @text, @id, socket) ->
		super @user, @text, @id, null

		@send = (message) =>

			###
			 * A stringified object is sent back to to the client
			 * these are its properties:
			 *
			 * id: message the bot was replying to
			 * text: the reply from the bot
			 * timestamp: time the bot replied
			###
			socket.emit('message', {
				id: @id,
				text: message
				timestamp: moment(Date.now(), 'x').format();
			});

	dm: (message) =>
		@send(message)

module.exports = WSMessage
