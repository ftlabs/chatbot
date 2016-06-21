// Description:
//   Display a list of all valid commands, by scraping file header comments
//   like this one from modules in the scripts folder
// Dependencies:
//
// Commands:
//   hubot help - display help message
//   hubot help <command> - information about that command
//   hubot help all - list all commands

'use strict';

  
// The structure is a list of sections,
// where each section has a name and some descriptive text, e.g. *Basic Search*)
//                    and a list of regexes matching the raw text of the individual command help texts
//                                          (the trick is to ensure there are no false positives).
// NB, if a particular command help text is changed, the fullHelptemplate may also need adjusting.
var fullHelpTemplate = [
	['*Searching for content*', ['search', 'articles', 'A<id>', 'topics', 'T<id>', 'define', 'definitions', 'zeitgeist']],
	['*Querying financial data*', ['price', 'prices', 'recommend']],
	['*Sending/sharing*', ['share']],
	['*Alerting*', ['follow', 'unfollow', 'following', 'alerts']],
	['*Offers*', [
		`What's is the cost of <a | an> <annual | monthly | > <premium | standard | trial | > subscription in <country>?`,
		'currencies',
		'countries',
		'Can I purchase a <premium | standard | trial | > subscription in <country>?'
	]]
];

var bullet = "\u2022";

var initialHelpTextLines = [
	'If interested in, say, apple:',
	bullet + ' search apple',
	bullet + ' price apple',
	bullet + ' recommend apple',
	bullet + ' topics apple',
	'For more on an article:',
	bullet + ' A2',
	'or a topic:',
	bullet + ' T1',
	bullet + ' follow T2',
	'More commands and details:',
	bullet + ' help all'
];

module.exports = function(robot) {
	robot.respond(/(?:h|help)(?:\s+(.*))?$/i, function(res) {

		let cmds;
		let filter;
		let prefix;
		let lines;

		// preprocess the cmds to have the relevant prefix - currently we prefer no name prefix, but conventionally it is `robot.alias || robot.name`
		prefix = '';
		cmds = robot.helpCommands().map(function(cmd) {
			cmd = cmd.replace(/hubot/ig, robot.name);
			return cmd.replace(new RegExp('^' + robot.name + '\\s*'), prefix);
		});

		// either pluck out the specific command being requested,
		// or construct the full help display,
		// as a list of text 'lines' which will be joined by \n.
		filter = res.match[1];

		if (!filter) {
			lines = initialHelpTextLines;
		} else if(filter.toLowerCase() === 'all') {
			lines = [];

			fullHelpTemplate.forEach(function(section) {
				lines.push(section[0]);
				section[1].forEach(function(item) {
					cmds
						.filter(function(cmd) {

							return cmd.match(new RegExp("^("+prefix+"\\s+)?"+item+"\\s", 'i'));
						})
						.map(function(cmd) {
							lines.push(" " + bullet + " "+cmd);
						})
					;
				});
			});
		} else {
			lines = cmds.filter(function(cmd) {
				return cmd.match(new RegExp(filter, 'i'));
			});
			if (lines.length === 0) {
				res.send("No available commands match " + filter + '. To see all commands, help all');
				return res.finish();
			}
		}
		res.send(lines.join("\n"));
		return res.finish();
	});

	if (robot.router.listen === undefined) return;

	robot.router.get("/" + robot.name + "/help", function(req, res) {
		let cmds;
		let emit;
		cmds = robot.helpCommands().map(function(cmd) {
			return cmd.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		});
		emit = "<p>" + (cmds.join('</p><p>')) + "</p>";
		emit = emit.replace(/hubot/ig, "<b>" + robot.name + "</b>");
		res.setHeader('content-type', 'text/html');
		return res.end("<!DOCTYPE html>\n<html>\n  <head>\n  <meta charset=\"utf-8\">\n  <title>" + robot.name + " Help</title>\n  <style type=\"text/css\">\n    body {\n      background: #d3d6d9;\n      color: #636c75;\n      text-shadow: 0 1px 1px rgba(255, 255, 255, .5);\n      font-family: Helvetica, Arial, sans-serif;\n    }\n    h1 {\n      margin: 8px 0;\n      padding: 0;\n    }\n    .commands {\n      font-size: 13px;\n    }\n    p {\n      border-bottom: 1px solid #eee;\n      margin: 6px 0 0 0;\n      padding-bottom: 5px;\n    }\n    p:last-child {\n      border: 0;\n    }\n  </style>\n  </head>\n  <body>\n    <h1>" + robot.name + " Help</h1>\n    <div class=\"commands\">\n      " + emit + "\n    </div>\n  </body>\n</html>");
	});
};
