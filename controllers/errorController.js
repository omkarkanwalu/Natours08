// omkar
const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDublicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  // console.log(value);
  const message = `Duplicate field value : ${value}, please use another value `;
  return new AppError(message, 400);
};

const handleValidaationerrorDB = (err) => {
  const errors = object.values(err.errors).map((el) => el, message);

  const message = `Invalid input data. ${errors.join('. ')} `;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token ,Please log in agian', 401);

const handleJWTExpiredError = () => {
  new AppError('Your Token Has Expired Please log in agian', 401);
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // B) RENDERED WEBSITE
    console.error('Error', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      msg: err.message,
    });
  }
};

const sendErrorPro = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational , trusted  error : send message to client

    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknow error : don't leak  error details
    // 1) log error
    console.error('ERROR', err);

    // 2) send response
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  // RENDERED WEBSITE
  //  A) Operational , trusted  error : send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      msg: err.message,
    });
  }
  // Programming or other unknow error : don't leak  error details
  // 1) log error
  // console.error('Error', err);

  // 2) send response
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong',
    msg: 'Please Try Agian later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    //

    if (error.code === 11000) error = handleDublicateFieldsDB(error);
    //
    if (error.name === 'ValidationError')
      error = handleValidaationerrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorPro(error, req, res);
  }
};
