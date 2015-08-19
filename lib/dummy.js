export class Logger {

	constructor() {

	}

	get() {
		let instance = () => {};

		instance.log = () => {};
		instance.info = () => {};
		instance.warn = () => {};
		instance.error = () => {};

		return instance;
	}

	reset() {}

	disable() {}

	isEnabled() {
		return false;
	}

	addReporter() {}

	addReporters() {}

	log() {}
	info() {}
	warn() {}
	error() {}

}

export class ConsoleLog {

	constructor() {}
	log() {}
	info() {}
	warn() {}
	error() {}

}

export class SocketLog {

	constructor() {}
	log() {}
	info() {}
	warn() {}
	error() {}

}

export const logger = new Logger();