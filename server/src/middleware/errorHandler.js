exports.notFound = (req, res, next) => {
  const err = new Error(`Not Found - ${req.originalUrl}`)
  err.statusCode = 404
  next(err)
}

exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
