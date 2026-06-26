class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.isJoi ? 400 : 500);
  const payload = {
    success: false,
    message: err.isJoi ? "Validation failed" : err.message || "Internal server error"
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (err.isJoi) {
    payload.details = err.details.map((detail) => detail.message);
  }

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    payload.stack = err.stack;
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  AppError,
  notFound,
  errorHandler
};
