const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, adminController.dashboard);
router.get('/users', requireAdmin, adminController.listUsers);
router.get('/projects', requireAdmin, adminController.listProjects);
router.post('/users/:id/set-admin', requireAdmin, adminController.setAdmin);
router.post('/users/:id/remove-admin', requireAdmin, adminController.removeAdmin);

module.exports = router;
