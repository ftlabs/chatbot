'use strict';
const expect = require("chai").expect;
const co = require('co');

const Helper = require('hubot-test-helper')
const helper = new Helper('../scripts');

require('dotenv').config({silent: true});

describe("Replies when requesting help", function() {
	let room;

	before(function(done) {
		room = helper.createRoom();
		done();
	});

	after(function() {
		room.destroy();
	});

	it("responds when greeted", function(done) {
		co(function *() {
			yield room.user.say('alice', '@hubot help');
			expect(room.messages).to.eql([
				['alice', '@hubot help'],
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
});