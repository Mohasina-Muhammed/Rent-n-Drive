const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Optional middlewear can be added here
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.log('[AUTH] No token found in ' + req.originalUrl);
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';
  if (secret === 'fallback_secret') {
    console.warn('[AUTH] Warning: Using fallback_secret. Check .env');
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    console.log('[AUTH] Success for user: ' + decoded.id);
    next();
  } catch (error) {
    console.error('[AUTH] Failed for ' + req.originalUrl + ': ' + error.name + ' - ' + error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
module.exports.authMiddleware = authMiddleware;
