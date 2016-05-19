module.exports = function () {
    var service = {
        init: init,
        logErrors: logErrors
    };
    return service;

    function init(error, req, res, next) {
        var errorType = typeof error,
            code = 500,
            message = 'Internal Server Error';

        switch (error.name) {
            case 'UnauthorizedError':
                code = error.status;
                message = undefined;
                break;
            case 'BadRequestError':
            case 'UnauthorizedAccessError':
            case 'NotFoundError':
                code = error.status;
                message = error.inner;
                break;
            default:
                break;
        }
        return res.status(code).json(message);
    }

    /* Our fall through error logger and errorHandler  */
    function logErrors(error, req, res, next) {
        var status = error.statusCode || 500;
        console.error(status + ' ' + (error.message ? error.message : error));
        if (error.stack) {
            console.error(error.stack);
        }
        next(error);
    }
};
