(function(context) {
	'use strict';

	var requirejs = require('requirejs');

	requirejs.config({
		baseUrl: __dirname + '/lib',
		nodeRequire: require
	});

	context.exports = {
		logger: requirejs('logviking/Logger'),
		ConsoleLog: requirejs('logviking/ConsoleLog'),
		SocketLog: requirejs('logviking/SocketLog')
	};
})(module);