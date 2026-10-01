const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getChallenge, verifyProof } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/aadhaar/challenge', protect, getChallenge);
router.post('/aadhaar/proof', protect, verifyProof);

module.exports = router;
