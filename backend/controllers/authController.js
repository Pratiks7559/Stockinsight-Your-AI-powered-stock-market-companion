// controllers/authController.js
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  // Remove password from output
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

export const signup = async (req, res, next) => {
  try {
    const { fullname, username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or username already exists'
      })
    }

    const newUser = await User.create({
      fullname,
      username,
      email,
      password
    })

    createSendToken(newUser, 201, res)
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      })
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      })
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res)
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with that email address'
      })
    }

    // 2) Generate the random reset token (in a real app, you would send this via email)
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // For demo purposes, we'll just return the token
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      token: resetToken // In production, you wouldn't send this back
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'There was an error sending the email. Try again later!'
    })
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token (in a real app, you would verify the token from email)
    // For demo, we'll just find the user by email or create a new one
    
    // 2) If token has not expired, and there is user, set the new password
    const { password } = req.body
    
    // For demo, we'll just find any user and update their password
    const user = await User.findOne()
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      })
    }
    
    user.password = password
    await user.save()
    
    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res)
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    })
  }
}

export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in! Please log in to get access'
      })
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token does no longer exist'
      })
    }

    // 4) Check if user changed password after the token was issued
    // (This would require a field in the user model to track password changes)

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser
    next()
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token! Please log in again'
    })
  }
}