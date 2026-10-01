const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, uploadAadhaar } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/aadhaar', protect, upload.single('aadhaar'), uploadAadhaar);

module.exports = router;
