'use strcit';

function NotFoundError(code, error) {
    var errorMessage = typeof error  === 'undefined' ? undefined : error.message;
    Error.call(this, errorMessage);
    Error.captureStackTrace(this, this.constructor);

    this.name = 'NotFoundError';
    this.message = errorMessage;
    this.code = typeof code === 'undefined' ? '404' : code;
    this.status = 404;
    this.inner = error;
}

NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

module.exports = NotFoundError;
