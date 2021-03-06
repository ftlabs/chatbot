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
				['hubot', "If interested in, say, apple:\n• search apple\n• price apple\n• recommend apple\nFor more on an article:\n• A2\nMore commands and details:\n• help all"],
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

	it("What's the cost of a monthly premium subscription in CAN?", function(done) {
		nock.cost('premium', 'CAN');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1].replace(/\*/g,'')).to.match(/Monthly premium subscriptions in CAN cost \$(\d*)/);
			done();
		}).catch(e => done(e));
	});

	it("What's the price of a standard subscription in JPN?", function(done) {
		nock.cost('standard', 'JPN');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1].replace(/\*/g,'')).to.match(/Monthly standard subscriptions in JPN cost ¥(.\d*\.{0,1}\d*)\nAnnual standard subscriptions in JPN cost ¥(.\d*\.{0,1}\d*)/);
			done();
		}).catch(e => done(e));
	});

	it("What's the price of a monthly subscription in ESP?", function(done) {
		nock.cost('standard', 'ESP');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1].replace(/\*/g,'')).to.match(/Monthly standard subscriptions in ESP cost \€(\d*)/);
			done();
		}).catch(e => done(e));
	});

	it("What's the price of a subscription in AUS?", function(done) {
		nock.cost('standard', 'AUS');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1].replace(/\*/g,'')).to.match(/Monthly standard subscriptions in AUS cost A\$(.\d*\.\d*)\nAnnual standard subscriptions in AUS cost A\$(.\d*\.\d*)/);
			done();
		}).catch(e => done(e));
	});
	it("What's the price of a subscription?", function(done) {
		nock.cost('standard', 'GBR');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1].replace(/\*/g,'')).to.match(/Monthly standard subscriptions in the uk cost £(.\d*\.\d*)\nAnnual standard subscriptions in the uk cost £(.\d*\.\d*)/);
			done();
		}).catch(e => done(e));
	});
	it("currencies", function(done) {
		nock.allOffers();
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1]).to.contain('We support:');
			done();
		}).catch(e => done(e));
	});

	it("countries", function(done) {
		nock.allOffers();
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages.length).to.eql(2);
			expect(room.messages[1][1]).to.match(/We sell subscriptions in: ([A-Z]{3},{0,1} {0,1})*/);
			done();
		}).catch(e => done(e));
	});

	it("can I buy a subscription in GBR?", function(done) {
		nock.cost('premium', 'GBR');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				[ 'alice', command ],
				[ 'hubot', 'Yes, you can buy a subscription in GBR.' ]
			]);
			done();
		}).catch(e => done(e));
	});

	it("can I buy a trial subscription in GBR?", function(done) {
		nock.cost('trial', 'GBR');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				[ 'alice', command ],
				[ 'hubot', 'Yes, you can buy a trial subscription in GBR.' ]
			]);
			done();
		}).catch(e => done(e));
	});

	it("can I buy a subscription in ABC?", function(done) {
		nock.cost('standard', 'ABC');
		const command = 'hubot ' + this.test.title;
		co(function *() {
			yield room.user.say('alice', command);
			expect(room.messages).to.eql([
				[ 'alice', command ],
				[ 'hubot', 'Sorry, you cannot buy a subscription in ABC.' ]
			]);
			done();
		}).catch(e => done(e));
	});
});