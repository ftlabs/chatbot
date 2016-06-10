'use strict';

const expect = require("chai").expect;
const co = require('co');
const nock = require('./nock');
const CatchAllMessage = require('hubot').CatchAllMessage;
process.env.NO_ONBOARDING = true;

const Helper = require('hubot-test-helper');

process.env.PORT = 3001;
require('dotenv').config({silent: true});

function waitABit(time) {
	return new Promise(function wait(resolve) {
		setTimeout(resolve, time);
	});
}

describe("Replies correctly to", function() {
	let room;
	let helper;

	before(function() {
		helper = new Helper(
			'../scripts/'
		);
	});

	beforeEach(function() {
		nock.cleanAll();
		room = helper.createRoom({
			httpd: false
		});

		const oldReceive = room.robot.receive;
		room.robot.receive = function name(message, resolveIn) {
			return new Promise(resolve => oldReceive.apply(room.robot, [message, resolve]))
			.then(() => {
				if (message instanceof CatchAllMessage) {
					message = message.message;
				}
				if (message.done) {
					resolveIn(message);
				} else {
					message.once('finish', () => resolveIn(message));
				}
			});
		};
	});

	it("help", function(done) {
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				['alice', command],
				['hubot', "If interested in, say, apple:\n• search apple\n• price apple\n• recommend apple\n• topics apple\nFor more on an article:\n• A2\nor a topic:\n• T1\n• follow T2\nMore commands and details:\n• help all"],
			]);
			done();
		}).catch(e => done(e));
	});

	it("good evening", function(done) {
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1]).to.match(/It is, isn't it|Hi|And to you/);
			done();
		}).catch(e => done(e));
	});

	it("failwithspace", function(done) {
		const command = 'hubot ' + this.test.title;
		const errorMessage = 'I don\'t know what that means.  Say `hi` to find out about me or `help` if you want to know everything I can do.';
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				['alice', command],
				['hubot', errorMessage],
			]);
			done();
		}).catch(e => done(e));
	});

	it("failnospace", function(done) {
		const command = 'hubot' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);

			// wait a smidge to ensure no response is received
			yield waitABit(100);
			expect(room.messages).to.eql([
				['alice', command],
			]);
			done();
		}).catch(e => done(e));
	});

	it("recommend apple", function(done) {
		nock.recommend();
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				['alice', command],
				['hubot', 'As of May 27, 2016, the consensus forecast amongst 51 polled investment analysts covering Apple Inc. advises that the company will outperform the market. This has been the consensus forecast since the sentiment of investment analysts deteriorated on Sep 29, 2011. The previous consensus forecast advised investors to purchase equity in Apple Inc..']
			]);
			done();
		}).catch(e => done(e));
	});
});