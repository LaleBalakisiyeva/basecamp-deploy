const express = require('express');
const router = express.Router({ mergeParams: true });
const threadsController = require('../controllers/threadsController');
const messagesController = require('../controllers/messagesController');
const { requireAuth } = require('../middleware/auth');
const { loadProject, requireProjectMember, requireProjectAdmin } = require('../middleware/project');

// All thread routes require auth + load project
router.use(requireAuth, loadProject, requireProjectMember);

router.get('/new', requireProjectAdmin, threadsController.newThread);
router.post('/', requireProjectAdmin, threadsController.create);
router.get('/:id', threadsController.show);
router.get('/:id/edit', requireProjectAdmin, threadsController.edit);
router.put('/:id', requireProjectAdmin, threadsController.update);
router.delete('/:id', requireProjectAdmin, threadsController.destroy);

// Nested messages
router.post('/:threadId/messages', messagesController.create);
router.get('/:threadId/messages/:id/edit', messagesController.edit);
router.put('/:threadId/messages/:id', messagesController.update);
router.delete('/:threadId/messages/:id', messagesController.destroy);

module.exports = router;
