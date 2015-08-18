
// fix console.apply for ie8/ie9
if (typeof window !== 'undefined') {
	if (Function.prototype.bind && window.console && typeof console.log === 'object') {// eslint-disable-line no-console
		['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd']
			.forEach(function(method) {
				console[method] = this.bind(console[method], console); // eslint-disable-line no-console
			}, Function.prototype.call);
	}
}

export default class ConsoleLog {
	
	constructor(config) {
		let key;
	
		config = config || {};
	
		this._config = {
			padComponent: true,
			componentNameWidth: 24,
			timeWidth: 8,
			blockTimeReset: 2000,
			trackTime: true,
			trackTimeByComponent: false,
			useColors: null,
			colors: [
				'lightseagreen',
				'forestgreen',
				'goldenrod',
				'dodgerblue',
				'darkorchid',
				'crimson',
				'darkred',
				'darkslategray'
			]
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


	log() {
		this._log.apply(this, ['log'].concat(Array.prototype.slice.call(arguments, 0)));
	}
	
	info() {
		this._log.apply(this, ['info'].concat(Array.prototype.slice.call(arguments, 0)));
	}
	
	warn() {
		this._log.apply(this, ['warn'].concat(Array.prototype.slice.call(arguments, 0)));
	}
	
	error() {
		this._log.apply(this, ['error'].concat(Array.prototype.slice.call(arguments, 0)));
	}
	
	_log(/* type, component */) {
		let parameters = Array.prototype.slice.call(arguments, 0),
			deltaTime = null,
			timeSinceStart = 0,
			currentTime,
			type,
			logType,
			component,
			paddedComponent,
			color,
			data;
	
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
			currentTime = (new Date()).getTime();
	
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
	
		this._blockTimeTimeout = setTimeout(function() {
			this._firstMessageTime = null;
			this._blockTimeTimeout = null;
			this._lastMessageTime = null;
		}.bind(this), this._config.blockTimeReset);
	
		logType = type;

		// if is for ie8
		if (console[logType].apply) { // eslint-disable-line no-console
			console[logType].apply(console, data); // eslint-disable-line no-console
		}
	}
	
	_formatTime(milliseconds) {
		let formattedTime = milliseconds,
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
	
	_pad(str, width) {
		let padSize = width - str.length + 1;
	
		if (padSize < 1) {
			return str;
		}
	
		return (new Array(padSize).join(' ')) + str;
	}
	
	_getDefaultUseColors() {
		if (typeof document === 'undefined') {
			// TODO implement colors for normal consoles
			return false;
		}
	
		// is webkit? http://stackoverflow.com/a/16459606/376773
		/* eslint-disable no-console */
		return (
			'WebkitAppearance' in document.documentElement.style)
			// is firebug? http://stackoverflow.com/a/398120/376773
			|| (window.console && (console.firebug || (console.exception && console.table)))
			// is firefox >= v31? https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			|| (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
		/* eslint-enable no-console */
	}
}