const jwt = require('jsonwebtoken')
const { User } = require('../models')

const sign = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    user.lastLogin = new Date()
    await user.save()
    res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) { next(err) }
}

async function register(req, res, next) {
  try {
    const user = await User.create(req.body)
    res.status(201).json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) { next(err) }
}

module.exports = { login, register }
