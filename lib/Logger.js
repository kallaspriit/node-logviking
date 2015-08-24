/**
 * Logger interface.
 *
 * @class Logger
 * @constructor
 * @module Core
 */
export class Logger {

	constructor() {
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
	get(component) {
		let logInterface = function() {
				let logComponentInterface = this.get(component);

				logComponentInterface.log.apply(logComponentInterface, arguments);
			}.bind(this),
			i;

		if (!this._isEnabled) {
			for (i = 0; i < this._levels.length; i++) {
				logInterface[this._levels[i]] = function() {}; // do nothing
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
			logInterface[this._levels[i]] = function(j) {
				this[this._levels[j]].apply(this, [component].concat(Array.prototype.slice.call(arguments, 1)));
			}.bind(this, i);
		}

		// add special count method
		logInterface._counter = 0;

		logInterface.count = function(text) {
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
	reset() {
		this._components = [];
		this._reporters = [];
		this._loggers = {};
		this._preReportersQueue = [];
		this._isEnabled = true;
	}

	/**
	 * Disables the logger and removes overhead.
	 */
	disable() {
		this._isEnabled = false;
	}

	/**
	 * Returns whether the logger is currently enabled.__defineGetter__
	 *
	 * @returns {boolean}
	 */
	isEnabled() {
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
	addReporter(reporter) {
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
	addReporters(/* reporter1, reporter2, reporterN */) {
		let i;

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
	log(/* component, arg1, ... */) {
		this._log.apply(this, ['log'].concat(Array.prototype.slice.call(arguments, 0)));
	}

	/**
	 * Information-level log message.
	 *
	 * @method info
	 */
	info(/* component, arg1, ... */) {
		this._log.apply(this, ['info'].concat(Array.prototype.slice.call(arguments, 0)));
	}

	/**
	 * Warning log message.
	 *
	 * @method warn
	 */
	warn(/* component, arg1, ... */) {
		this._log.apply(this, ['warn'].concat(Array.prototype.slice.call(arguments, 0)));
	}

	/**
	 * Error log message.
	 *
	 * @method error
	 */
	error(/* component, arg1, ... */) {
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
	_log(type, component/* , arg1, ... */) {
		let i;

		if (this._components.indexOf(component) === -1) {
			this._components.push(component);
		}

		if (this._reporters.length > 0) {
			for (i = 0; i < this._reporters.length; i++) {
				this._reporters[i][type].apply(
					this._reporters[i],
					Array.prototype.slice.call(arguments, 0).slice(1)
				);
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
	_reportQueuedMessages() {
		let message;

		while (this._preReportersQueue.length > 0) {
			message = this._preReportersQueue.shift();

			this._log.apply(this, message);
		}
	}
}

export default new Logger();