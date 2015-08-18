/**
 * Logs data to a websocket.
 *
 * @class SocketLog
 * @constructor
 * @module Core
 */
export default class SocketLog {

	constructor(host, port) {
		this._ws = null;
		this._host = host;
		this._port = port;
		this._messageCount = 0;
		this._requestQueue = [];
		this._hadValidConnection = false;

		this._connect(this._host, this._port);
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

	_log(type, component) {
		let parameters = Array.prototype.slice.call(arguments, 0).slice(2);

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

	_request(handler, parameters) {
		let id = this._messageCount++,
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

	_preprocessData(data) {
		let key,
			i;

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

	_getFunctionName(fn) {
		let name = fn.toString();

		name = name.substr('function '.length);
		name = name.substr(0, name.indexOf('('));

		return name;
	}

	_connect(host, port) {
		let WebSocketClient = typeof WebSocket !== 'undefined' ? WebSocket : null;

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

	_reconnect() {
		this._connect(this._host, this._port);
	}

	_onSocketOpen() {
		let request;

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

	_onSocketMessage(payload) {
		if (payload.type !== 'message' || payload.data.substr(0, 1) !== '{') {
			return;
		}

		let request = JSON.parse(payload.data);

		switch (request.handler) {
			case 'execute-javascript':
				this._handleExecuteJavascript(request.parameters.value);
				break;

			default:
				// ignore
				break;
		}
	}

	_onSocketClose() {
		if (this._hadValidConnection) {
			window.setTimeout(function() {
				this._reconnect();
			}.bind(this), 1000);
		}
	}

	_onSocketError() {

	}

	_isConnectionValid() {
		return this._ws !== null && this._ws.readyState === 1;
	}

	_handleExecuteJavascript(value) {
		let result = eval(value);

		this._log('javascript', 'LogViking', result);
	}
}