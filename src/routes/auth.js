const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middleware/auth');

router.get('/register', requireGuest, authController.newUser);
router.post('/register', requireGuest, authController.createUser);
router.get('/sign-in', requireGuest, authController.signInPage);
router.post('/sign-in', requireGuest, authController.signIn);
router.post('/sign-out', requireAuth, authController.signOut);

module.exports = router;
