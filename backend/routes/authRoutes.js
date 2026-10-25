const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updateMeSchema } = require('../validators/schemas');
const { register, login, getMe, updateMe, deleteMyData } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateMeSchema), updateMe);
router.delete('/data', protect, deleteMyData);

module.exports = router;
