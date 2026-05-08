const express = require('express');
const router = express.Router({ mergeParams: true });
const membersController = require('../controllers/membersController');
const { requireAuth } = require('../middleware/auth');
const { loadProject, requireProjectAdmin } = require('../middleware/project');

router.post('/', requireAuth, loadProject, requireProjectAdmin, membersController.add);
router.delete('/:userId', requireAuth, loadProject, requireProjectAdmin, membersController.remove);

module.exports = router;
