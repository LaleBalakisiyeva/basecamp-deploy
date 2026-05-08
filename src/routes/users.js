const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireAuth } = require('../middleware/auth');

router.get('/:id', requireAuth, usersController.show);
router.delete('/:id', requireAuth, usersController.destroy);

module.exports = router;
