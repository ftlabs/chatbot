'use strict';
const expect = require("chai").expect;
const co = require('co');

const Helper = require('hubot-test-helper');

process.env.PORT = 3001;
require('dotenv').config({silent: true});

describe("Replies correctly", function() {
	let room;

	afterEach(function() {
		room.destroy();
	});

	it("help", function(done) {
		const helper = new Helper('../scripts/help.js');
		room = helper.createRoom();
		const command = '@hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				['alice', command],
				['hubot', `If interested in, say, apple:
• search apple
• price apple
• recommend apple
• topics apple
For more on an article:
• A2
or a topic:
• T1
• follow T2
More commands and details:
• help all`],
			]);
			done();
		}).catch(e => done(e));
	});

	it("suggest angela merkel", function(done) {
		const helper = new Helper('../scripts/help.js');
		room = helper.createRoom();
		const command = '@hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				['alice', command],
				['hubot', 'response'],
			]);
			done();
		}).catch(e => done(e));
	});
});