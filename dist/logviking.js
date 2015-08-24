(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["logviking"] = factory();
	else
		root["logviking"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

	var _Logger = __webpack_require__(1);

	exports.logger = _interopRequire(_Logger);
	Object.defineProperty(exports, 'Logger', {
	  enumerable: true,
	  get: function get() {
	    return _Logger.Logger;
	  }
	});

	var _ConsoleLog = __webpack_require__(2);

	exports.ConsoleLog = _interopRequire(_ConsoleLog);

	var _SocketLog = __webpack_require__(3);

	exports.SocketLog = _interopRequire(_SocketLog);

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Logger interface.
	 *
	 * @class Logger
	 * @constructor
	 * @module Core
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Logger = (function () {
		function Logger() {
			_classCallCheck(this, Logger);

			this._components = [];
			this._levels = ['log', 'info', 'warn', 'error'];
			this._reporters = [];
			this._loggers = {};
			this._preReportersQueue = [];
			this._isEnabled = true;
		}

		/**
	  * Use this method to get the logger for a specific component.
	  *
	  * The returned logger interface has the log, info, warn and error methods and will include the component name in
	  * all requests.
	  *
	  * @method get
	  * @param {string} component Component name
	  * @returns {object}
	  */

		_createClass(Logger, [{
			key: 'get',
			value: function get(component) {
				var logInterface = (function () {
					var logComponentInterface = this.get(component);

					logComponentInterface.log.apply(logComponentInterface, arguments);
				}).bind(this),
				    i = undefined;

				if (!this._isEnabled) {
					for (i = 0; i < this._levels.length; i++) {
						logInterface[this._levels[i]] = function () {}; // do nothing
					}

					return logInterface;
				}

				// return existing logger interface if already created
				if (typeof this._loggers[component] !== 'undefined') {
					return this._loggers[component];
				}

				if (this._components.indexOf(component) === -1) {
					this._components.push(component);
				}

				for (i = 0; i < this._levels.length; i++) {
					logInterface[this._levels[i]] = (function (j) {
						this[this._levels[j]].apply(this, [component].concat(Array.prototype.slice.call(arguments, 1)));
					}).bind(this, i);
				}

				// add special count method
				logInterface._counter = 0;

				logInterface.count = function (text) {
					logInterface.log(text, ++logInterface._counter);
				};

				this._loggers[component] = logInterface;

				logInterface.component = component;

				return logInterface;
			}

			/**
	   * Resets the logger.
	   *
	   * @method reset
	   */
		}, {
			key: 'reset',
			value: function reset() {
				this._components = [];
				this._reporters = [];
				this._loggers = {};
				this._preReportersQueue = [];
				this._isEnabled = true;
			}

			/**
	   * Disables the logger and removes overhead.
	   */
		}, {
			key: 'disable',
			value: function disable() {
				this._isEnabled = false;
			}

			/**
	   * Returns whether the logger is currently enabled.__defineGetter__
	   *
	   * @returns {boolean}
	   */
		}, {
			key: 'isEnabled',
			value: function isEnabled() {
				return this._isEnabled;
			}

			/**
	   * Registers a new log reporter.
	   *
	   * The reporter should be an object with methods called:
	   * - log
	   * - info
	   * - warn
	   * - error
	   *
	   * @method addReporter
	   * @param {object} reporter Reporter to add
	   */
		}, {
			key: 'addReporter',
			value: function addReporter(reporter) {
				this._reporters.push(reporter);

				this._reportQueuedMessages();
			}

			/**
	   * Registers a list of new log reporter.
	   *
	   * The reporter should be an object with methods called:
	   * - log
	   * - info
	   * - warn
	   * - error
	   *
	   * @method addReporters
	   */
		}, {
			key: 'addReporters',
			value: function addReporters() /* reporter1, reporter2, reporterN */{
				var i = undefined;

				for (i = 0; i < arguments.length; i++) {
					this._reporters.push(arguments[i]);
				}

				this._reportQueuedMessages();
			}

			/**
	   * Verbose log message.
	   *
	   * @method log
	   */
		}, {
			key: 'log',
			value: function log() /* component, arg1, ... */{
				this._log.apply(this, ['log'].concat(Array.prototype.slice.call(arguments, 0)));
			}

			/**
	   * Information-level log message.
	   *
	   * @method info
	   */
		}, {
			key: 'info',
			value: function info() /* component, arg1, ... */{
				this._log.apply(this, ['info'].concat(Array.prototype.slice.call(arguments, 0)));
			}

			/**
	   * Warning log message.
	   *
	   * @method warn
	   */
		}, {
			key: 'warn',
			value: function warn() /* component, arg1, ... */{
				this._log.apply(this, ['warn'].concat(Array.prototype.slice.call(arguments, 0)));
			}

			/**
	   * Error log message.
	   *
	   * @method error
	   */
		}, {
			key: 'error',
			value: function error() /* component, arg1, ... */{
				this._log.apply(this, ['error'].concat(Array.prototype.slice.call(arguments, 0)));
			}

			/**
	   * Private method used to pass the log messages to reporters.
	   *
	   * @method _log
	   * @param {string} type Message type
	   * @param {string} component Component name
	   * @private
	   */
		}, {
			key: '_log',
			value: function _log(type, component /* , arg1, ... */) {
				var i = undefined;

				if (this._components.indexOf(component) === -1) {
					this._components.push(component);
				}

				if (this._reporters.length > 0) {
					for (i = 0; i < this._reporters.length; i++) {
						this._reporters[i][type].apply(this._reporters[i], Array.prototype.slice.call(arguments, 0).slice(1));
					}
				} else {
					this._preReportersQueue.push(Array.prototype.slice.call(arguments, 0));
				}
			}

			/**
	   * Re-logs the queued messages that were registered when no reporters had beed added.
	   *
	   * @method _reportQueuedMessages
	   * @private
	   */
		}, {
			key: '_reportQueuedMessages',
			value: function _reportQueuedMessages() {
				var message = undefined;

				while (this._preReportersQueue.length > 0) {
					message = this._preReportersQueue.shift();

					this._log.apply(this, message);
				}
			}
		}]);

		return Logger;
	})();

	exports.Logger = Logger;
	exports['default'] = new Logger();

/***/ },
/* 2 */
/***/ function(module, exports) {

	
	// fix console.apply for ie8/ie9
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	if (typeof window !== 'undefined') {
		if (Function.prototype.bind && window.console && typeof console.log === 'object') {
			// eslint-disable-line no-console
			['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'].forEach(function (method) {
				console[method] = this.bind(console[method], console); // eslint-disable-line no-console
			}, Function.prototype.call);
		}
	}

	var ConsoleLog = (function () {
		function ConsoleLog(config) {
			_classCallCheck(this, ConsoleLog);

			var key = undefined;

			config = config || {};

			this._config = {
				padComponent: true,
				componentNameWidth: 24,
				timeWidth: 8,
				blockTimeReset: 2000,
				trackTime: true,
				trackTimeByComponent: false,
				useColors: null,
				colors: ['lightseagreen', 'forestgreen', 'goldenrod', 'dodgerblue', 'darkorchid', 'crimson', 'darkred', 'darkslategray']
			};
			this._colorIndex = 0;
			this._componentToColorIndexMap = {};
			this._componentLastLogTime = {};
			this._firstMessageTime = null;
			this._lastMessageTime = null;
			this._blockTimeTimeout = null;

			if (typeof config === 'object' && config !== null) {
				for (key in config) {
					if (!config.hasOwnProperty(key)) {
						continue;
					}

					this._config[key] = config[key];
				}
			}

			if (this._config.useColors === null) {
				this._config.useColors = this._getDefaultUseColors();
			}
		}

		_createClass(ConsoleLog, [{
			key: 'log',
			value: function log() {
				this._log.apply(this, ['log'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: 'info',
			value: function info() {
				this._log.apply(this, ['info'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: 'warn',
			value: function warn() {
				this._log.apply(this, ['warn'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: 'error',
			value: function error() {
				this._log.apply(this, ['error'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: '_log',
			value: function _log() /* type, component */{
				var parameters = Array.prototype.slice.call(arguments, 0),
				    deltaTime = null,
				    timeSinceStart = 0,
				    currentTime = undefined,
				    type = undefined,
				    logType = undefined,
				    component = undefined,
				    paddedComponent = undefined,
				    color = undefined,
				    data = undefined;

				if (parameters.length < 3) {
					console[type].apply(console, parameters); // eslint-disable-line no-console
				}

				type = parameters.shift();
				component = parameters.shift();

				paddedComponent = component;

				if (this._config.padComponent) {
					if (component.length + 1 > this._config.componentNameWidth) {
						this._config.componentNameWidth = component.length + 1;
					}

					if (paddedComponent.length < this._config.componentNameWidth) {
						paddedComponent = this._pad(paddedComponent, this._config.componentNameWidth);
					}
				}

				if (this._config.useColors) {
					if (typeof this._componentToColorIndexMap[component] === 'undefined') {
						this._componentToColorIndexMap[component] = this._colorIndex;

						this._colorIndex = (this._colorIndex + 1) % this._config.colors.length;
					}

					color = this._config.colors[this._componentToColorIndexMap[component]];
					data = ['%c' + paddedComponent, 'color: ' + color + ';'].concat(parameters);
				} else {
					data = [paddedComponent].concat(parameters);
				}

				if (this._config.trackTime) {
					currentTime = new Date().getTime();

					if (this._config.trackTimeByComponent && typeof this._componentLastLogTime[component] !== 'undefined') {
						deltaTime = currentTime - this._componentLastLogTime[component];
					} else if (!this._config.trackTimeByComponent && this._lastMessageTime !== null) {
						deltaTime = currentTime - this._lastMessageTime;
					}

					if (this._firstMessageTime !== null) {
						timeSinceStart = currentTime - this._firstMessageTime;
					} else {
						this._firstMessageTime = currentTime;
					}

					this._componentLastLogTime[component] = currentTime;

					if (deltaTime !== null) {
						data[0] = this._pad(this._formatTime(deltaTime), this._config.timeWidth) + data[0];
					} else {
						data[0] = this._pad('', this._config.timeWidth) + data[0];
					}

					data[0] = this._pad(this._formatTime(timeSinceStart), this._config.timeWidth) + data[0];

					this._lastMessageTime = currentTime;
				}

				if (this._blockTimeTimeout !== null) {
					clearTimeout(this._blockTimeTimeout);

					this._blockTimeTimeout = null;
				}

				this._blockTimeTimeout = setTimeout((function () {
					this._firstMessageTime = null;
					this._blockTimeTimeout = null;
					this._lastMessageTime = null;
				}).bind(this), this._config.blockTimeReset);

				logType = type;

				// if is for ie8
				if (console[logType].apply) {
					// eslint-disable-line no-console
					console[logType].apply(console, data); // eslint-disable-line no-console
				}
			}
		}, {
			key: '_formatTime',
			value: function _formatTime(milliseconds) {
				var formattedTime = milliseconds,
				    unit = 'ms';

				if (milliseconds > 60000) {
					formattedTime = (milliseconds / 60000).toPrecision(2);
					unit = 'm';
				} else if (milliseconds > 2000) {
					formattedTime = (milliseconds / 1000).toPrecision(3);
					unit = 's';
				}

				return formattedTime.toString() + unit;
			}
		}, {
			key: '_pad',
			value: function _pad(str, width) {
				var padSize = width - str.length + 1;

				if (padSize < 1) {
					return str;
				}

				return new Array(padSize).join(' ') + str;
			}
		}, {
			key: '_getDefaultUseColors',
			value: function _getDefaultUseColors() {
				if (typeof document === 'undefined') {
					// TODO implement colors for normal consoles
					return false;
				}

				// is webkit? http://stackoverflow.com/a/16459606/376773
				/* eslint-disable no-console */
				return 'WebkitAppearance' in document.documentElement.style ||
				// is firebug? http://stackoverflow.com/a/398120/376773
				window.console && (console.firebug || console.exception && console.table)
				// is firefox >= v31? https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				 || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31;
				/* eslint-enable no-console */
			}
		}]);

		return ConsoleLog;
	})();

	exports['default'] = ConsoleLog;
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Logs data to a websocket.
	 *
	 * @class SocketLog
	 * @constructor
	 * @module Core
	 */
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var SocketLog = (function () {
		function SocketLog(host, port) {
			_classCallCheck(this, SocketLog);

			this._ws = null;
			this._host = host;
			this._port = port;
			this._messageCount = 0;
			this._requestQueue = [];
			this._hadValidConnection = false;

			this._connect(this._host, this._port);
		}

		_createClass(SocketLog, [{
			key: 'log',
			value: function log() {
				this._log.apply(this, ['log'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: 'info',
			value: function info() {
				this._log.apply(this, ['info'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: 'warn',
			value: function warn() {
				this._log.apply(this, ['warn'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: 'error',
			value: function error() {
				this._log.apply(this, ['error'].concat(Array.prototype.slice.call(arguments, 0)));
			}
		}, {
			key: '_log',
			value: function _log(type, component) {
				var parameters = Array.prototype.slice.call(arguments, 0).slice(2);

				try {
					this._request('log', {
						type: type,
						component: component,
						parameters: parameters,
						date: new Date()
					});
				} catch (e) {
					this._request('log', {
						type: type,
						component: component,
						parameters: ['evaluation failed: ' + e.message],
						date: new Date()
					});
				}
			}
		}, {
			key: '_request',
			value: function _request(handler, parameters) {
				var id = this._messageCount++,
				    payload = '';

				if (!this._isConnectionValid()) {
					this._requestQueue.push({
						handler: handler,
						parameters: parameters
					});

					return;
				}

				try {
					payload = JSON.stringify({
						id: id,
						handler: handler,
						parameters: parameters,
						expectResponse: false
					});
				} catch (e) {
					throw new Error('serializing failed (' + e.message + ')');
				}

				if (payload.length > 4086) {
					throw new Error('message too long');
				}

				this._ws.send(payload);
			}
		}, {
			key: '_preprocessData',
			value: function _preprocessData(data) {
				var key = undefined,
				    i = undefined;

				if (typeof data === 'undefined') {
					return '<{[UNDEFINED]}>';
				} else if (data instanceof Date) {
					return '<{[DATE:' + data.toString() + ']}>';
				} else if (typeof data === 'function') {
					return '<{[FUNCTION:' + this._getFunctionName(data) + ']}>';
				} else if (Object.prototype.toString.call(data) === '[object Object]') {
					for (key in data) {
						if (!data.hasOwnProperty(key)) {
							continue;
						}

						data[key] = this._preprocessData(data[key]);
					}

					return data;
				} else if (Object.prototype.toString.call(data) === '[object Array]') {
					for (i = 0; i < data.length; i++) {
						data[i] = this._preprocessData(data[i]);
					}

					return data;
				}

				return data;
			}
		}, {
			key: '_getFunctionName',
			value: function _getFunctionName(fn) {
				var name = fn.toString();

				name = name.substr('function '.length);
				name = name.substr(0, name.indexOf('('));

				return name;
			}
		}, {
			key: '_connect',
			value: function _connect(host, port) {
				var WebSocketClient = typeof WebSocket !== 'undefined' ? WebSocket : null;

				if (WebSocketClient === null) {
					return;
				}

				try {
					this._ws = new WebSocketClient('ws://' + host + ':' + port);

					this._ws.onopen = this._onSocketOpen.bind(this);
					this._ws.onmessage = this._onSocketMessage.bind(this);
					this._ws.onclose = this._onSocketClose.bind(this);
					this._ws.onerror = this._onSocketError.bind(this);
				} catch (e) {
					console.error(e); // eslint-disable-line no-console
				}
			}
		}, {
			key: '_reconnect',
			value: function _reconnect() {
				this._connect(this._host, this._port);
			}
		}, {
			key: '_onSocketOpen',
			value: function _onSocketOpen() {
				var request = undefined;

				this._requestQueue.unshift({
					handler: 'becomeInspected',
					parameters: {}
				});

				this._requestQueue.unshift({
					handler: 'refresh',
					parameters: {}
				});

				while (this._requestQueue.length > 0) {
					request = this._requestQueue.shift();

					try {
						this._request(request.handler, request.parameters);
					} catch (e) {
						this._request('log', {
							type: request.parameters.type,
							component: request.parameters.component,
							parameters: ['evaluation failed: ' + e.message],
							date: new Date()
						});
					}
				}

				this._hadValidConnection = true;
			}
		}, {
			key: '_onSocketMessage',
			value: function _onSocketMessage(payload) {
				if (payload.type !== 'message' || payload.data.substr(0, 1) !== '{') {
					return;
				}

				var request = JSON.parse(payload.data);

				switch (request.handler) {
					case 'execute-javascript':
						this._handleExecuteJavascript(request.parameters.value);
						break;

					default:
						// ignore
						break;
				}
			}
		}, {
			key: '_onSocketClose',
			value: function _onSocketClose() {
				if (this._hadValidConnection) {
					window.setTimeout((function () {
						this._reconnect();
					}).bind(this), 1000);
				}
			}
		}, {
			key: '_onSocketError',
			value: function _onSocketError() {}
		}, {
			key: '_isConnectionValid',
			value: function _isConnectionValid() {
				return this._ws !== null && this._ws.readyState === 1;
			}
		}, {
			key: '_handleExecuteJavascript',
			value: function _handleExecuteJavascript(value) {
				var result = eval(value);

				this._log('javascript', 'LogViking', result);
			}
		}]);

		return SocketLog;
	})();

	exports['default'] = SocketLog;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;