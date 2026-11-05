const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'The request could not be completed. Try again.';

  if (err.name === 'CastError') {
    status = 404;
    message = 'Record not found';
  } else if (err.code === 11000) {
    status = 400;
    message = 'A user with this email already exists';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join('. ');
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body must be valid JSON';
  } else if (status === 413) {
    message = 'Request body is too large';
  }

  if (status >= 500) {
    console.error(err);
    message = 'The request could not be completed. Try again.';
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
