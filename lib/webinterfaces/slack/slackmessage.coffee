
request = require 'request-promise'
WebMessage = require('../webmessage')

class SlackWebMessage extends WebMessage

	constructor: (@user, @text, @id, @robot, @res, @target) ->
		# target is the slack WebHook to send responses beyond the first
		super @user, @text, @id, @res
		@closedConn = false

		# Parrot the command recieved back to the chat
		request
			url: @target
			method: 'POST'
			form:
				payload: JSON.stringify {
						text: "Command recieved: " + @text.substr(@robot.name.length + 2)
						channel: @user.room
						username: @robot.name
						icon_url: "http://im.ft-static.com/m/icons/apple-touch-icon.png"
					}
		.catch(
			(err) ->
				console.log(err);
		)

	send: (message) =>

		# Close the connection because messages send via res.end are not visible.
		if not @closedConn
			@res.end ""
			@closedConn = true

		# Make a request to the endpoint to send the message
		request
			url: @target
			method: 'POST'
			form:
				payload: JSON.stringify {
						text: message
						channel: @user.room
						username: @robot.name
						icon_url: "http://im.ft-static.com/m/icons/apple-touch-icon.png"
					}
		.catch(
			(err) ->
				console.log(err);
		)

	dm: (message) =>

		console.log('Setup.js Sending DM on reply to 1"' + @text + '"');

		# Close the response
		if (not @closedConn)
			@res.end ""
			@closedConn = true

		# Send a request to the slack hook endpoint
		request
			url: @target
			method: 'POST'
			form:
				payload: JSON.stringify {
						text: message
						channel: '@' + @user.name
						username: @robot.name
						icon_url: "http://im.ft-static.com/m/icons/apple-touch-icon.png"
					}
		.catch(
			(err) ->
				console.log(err);
		)

module.exports = SlackWebMessage