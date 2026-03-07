const logger = require('../utils/logger');

function notFoundHandler(req, res) {
	return res.status(404).json({
		error: 'not_found',
		message: `Route not found: ${req.method} ${req.originalUrl}`,
	});
}

function errorHandler(err, req, res, next) {
	logger.log(
		'api_error',
		{
			path: req.originalUrl,
			method: req.method,
			error: err,
		},
		'error'
	);

	const statusCode = Number(err.statusCode || err.status || 500);
	const message = err.message || 'Internal server error';

	return res.status(statusCode).json({
		error: statusCode >= 500 ? 'analysis_failed' : 'request_failed',
		message,
		...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
	});
}

module.exports = {
	notFoundHandler,
	errorHandler,
};