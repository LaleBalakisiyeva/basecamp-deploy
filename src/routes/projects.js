const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, projectsController.index);
router.get('/new', requireAuth, projectsController.newProject);
router.post('/', requireAuth, projectsController.create);
router.get('/:id', requireAuth, projectsController.show);
router.get('/:id/edit', requireAuth, projectsController.edit);
router.put('/:id', requireAuth, projectsController.update);
router.delete('/:id', requireAuth, projectsController.destroy);

module.exports = router;
