const AppError = require("../utils/appError");

// development error
const sendErrorDev = (error, res) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    const message = error.message;
    const stack = error.stack;

    console.error('Detailed error log:', error); // Log the complete error object
    res.status(statusCode).json({
        status,
        message,
        stack,
    })
}


// production error
const sendErrorProd = (error, res) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    const message = error.message;
    const stack = error.stack;

    //operational error
    if(error.isOperational) {    
        
      return  res.status(statusCode).json({
            status,
            message,
        });
    }
    
    //error not handle inside the app
   // console.log(error.name, error.message, stack);
    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong',
        
    });
}


// global error handler
const globalErrorHandler = (err, req, res, next) => {

    if(err.name === 'JsonWebTokenError'){
        err = new AppError('Invalid token', 401)
    }
    if(err.name === 'SequelizeValidationError'){
        err = new AppError(err.errors[0].message, 400)
    }

    if(err.name === 'SequelizeUniqueConstraintError'){
        err = new AppError(err.errors[0].message, 400)
    }
    
    if(process.env.NODE_ENV === 'development') {
        return sendErrorDev(err, res);
    }

    sendErrorProd(err, res);
};

module.exports = globalErrorHandler;