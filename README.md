# FTLabs Chatbot Hubot

Internal Doc [https://docs.google.com/document/d/1OctttbtcdZUMngXXi5dpic3Yhyij1fxsscx31JmCZFw/edit#](https://docs.google.com/document/d/1OctttbtcdZUMngXXi5dpic3Yhyij1fxsscx31JmCZFw/edit#)

# About,

This is the Financial Times Chatbot, running from:

Monday 18th May 2015 - Friday 15th June 2015

as an initial experiment in accessing FT content via a Chatbot in a companies internal messaging. We supported a few platforms:

* Slack
* GChat
* [Web Interface](http://ftlabs-chatbot-hubot.herokuapp.com/v1/web-widget)
* rest interface: http://ftlabs-chatbot-test.herokuapp.com/v1/rest

```
Example Post request

POST to http://ftlabs-chatbot-test.herokuapp.com/v1/rest

content: application/json

{
	message: "recommend apple"
}
```

The project has been resurrected as of May 30th 2016 due to growing interest in Chatbots in the wider media community.

# Features

Chatbot, if a query is not understood then it allows for a human operator to respond.

Example queries:



# Building

The very basic way to start is:

```
$ npm install
$ npm start
```

This will start the bot in shell mode and interactive. If the HUBOT_SLACK_TOKEN is set, it will default to slack. Chat with `ftbottest` when developing locally.

For full usage of Chatbot you will require the following environment variables (found in LastPass. Internal FT usage only)

## Tests

To run tests:

```
$ npm test
```

Add tests to `/test/`, mocking any server calls with `nock` (see examples in `/test/nock.js`)

## Basic

* PORT - Port to run the webserver from the bot uses this +1, default 3001 (bot uses 3002)
* REDISTOGO_URL - Redis To Go server to connect to, defaults to looking for a local redis instance
* HUBOT_HEROKU_KEEPALIVE_URL - URL to stop Redis going to sleep

## Interfaces

You can only pick one:

* HUBOT_WEB_ENDPOINTS - set to 1 to use the web endpoint.

* HUBOT_SLACK_TOKEN - Required to work with slack, token for connecting to slack bot.
* SLACK_HOOK_URL - Required to work with slack, team url for connecting to slack bot.

* HUBOT_GTALK_USERNAME - The bot's username for GTalk will possess that account and respond for it.

## API keys

* ELASTIC_SEARCH_KEY - next-search api
* EMAILTHIS_RECAPTCHA_KEY - email this api
* EMAILTHIS_SECRET - email this api
* BITLY_API_KEY - bitly api
* BITLY_LOGIN - bitly api
* CAPI_API_KEY - capi api
* MARKETS_API_KEY - market api
* OFFERS_API_KEY - offer api

## Adding new commands

Drop a script in `/scripts` starting with:

```
// Description:
//     ....
// Commands:
//     ....
```

## Requirements
Node 6+