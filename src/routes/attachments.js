const express = require('express');
const router = express.Router({ mergeParams: true });
const attachmentsController = require('../controllers/attachmentsController');
const { requireAuth } = require('../middleware/auth');
const { loadProject, requireProjectMember } = require('../middleware/project');
const { upload } = require('../middleware/upload');

router.post('/', requireAuth, loadProject, requireProjectMember,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        req.flash('error', err.message);
        return res.redirect(`/projects/${req.params.projectId}`);
      }
      next();
    });
  },
  attachmentsController.create
);

router.delete('/:id', requireAuth, loadProject, requireProjectMember, attachmentsController.destroy);

module.exports = router;
