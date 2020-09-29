const winston = require('winston')
const logger = winston.createLogger({
	level: 'silly',
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.simple()
	),
	transports: [
		new winston.transports.Console({level: 'silly'}),
	]
})

module.exports = logger