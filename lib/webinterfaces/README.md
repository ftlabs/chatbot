## Hubot Slash Command Support

This allows a Hubot to both recieve messages from the adater and from the WebServer and reply back to the adapter and WebServer respectively.

### How it works

From the top down:

A WebMessage class is created (which extends TextMessage, the class which handles messages from the client)

Each integration extends WebMessage to implement it's own `send` and `dm` functions which will handle sending/recieving messages much like an adapter would.

in `scipts/__super.js` robot.Response is extended so that if it is constructed with a Message object of type WebMessage `.send` sends the message to the `send` functions defined in the Message object rather than the adapter like it does by default.

The listeners which match the message create a new robot.Response as usual and .send goes through the Web endpoint.

### Limitations

Only `.send` is extended so other commands such as .reply go through the adapter as usual.

Only WebMessages are picked up so it would not pick up a message which falls through and becomes a CatchAllMessage.