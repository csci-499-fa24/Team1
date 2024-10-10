// custom error class

class AppError extends Error {
    constructor(message, statusCode) {
        super(message)   // pass to parent class
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';  
        this.isOperational = true;   //a property that tell it is a custom error

        Error.captureStackTrace(this, this.constructor); //syntax to capture stacktrace, get line number and file name
    }
}

module.exports = AppError