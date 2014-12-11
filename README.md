node-logviking
==============

JavaScript advanced remote logging for node.js

Example
-------
```javascript
var LogViking = require('logviking'),
	logger = LogViking.logger,
	log = logger.get('Test');


logger.addReporters(
	new LogViking.ConsoleLog(),
	new LogViking.SocketLog('localhost', 9000)
);

log.info('Hello LogViking');
```