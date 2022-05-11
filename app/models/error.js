class BaseError extends Error {
	message;
	stack;

	constructor(message, stack, httpCode) {
		super(message);
		this.error = "ERROR";
		this.message = message;
		this.stack = stack;
		this.code = httpCode;
	}
}

module.exports = BaseError;
