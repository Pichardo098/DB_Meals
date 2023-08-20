const AppError = require('../utils/appError');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired, please login again', 401);

const handleJWTError = () =>
  new AppError('Invalid Token. Please login again', 401);

const handleCastError22001 = () =>
  new AppError('This sentence exceeded the number of characters allowed', 400);

const handleCastError22P02 = () =>
  new AppError('Invalid Data type in database', 400);

const handleCastError23505 = () =>
  new AppError('Duplicate field value: please use another value', 400);

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};

const sendErrorDev = (err, res) => {
  console.log(err);
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    err,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (err.parent?.code === '22001') error = handleCastError22001();
    if (err.parent?.code === '22P02') error = handleCastError22P02();
    if (err.parent?.code === '23505') error = handleCastError23505();
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};

module.exports = globalErrorHandler;
