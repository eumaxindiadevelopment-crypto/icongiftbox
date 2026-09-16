const jwt = require('jsonwebtoken')

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

exports.requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }
  next()
}
