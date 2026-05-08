const path = require('path');
const fs = require('fs');
const { Attachment } = require('../models');
const { getFormat } = require('../middleware/upload');

const attachmentsController = {
  // POST /projects/:projectId/attachments
  create: async (req, res) => {
    try {
      if (!req.file) {
        req.flash('error', 'No file uploaded or file type not allowed.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      await Attachment.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        format: getFormat(req.file.mimetype),
        size: req.file.size,
        projectId: req.project.id,
        uploadedById: req.session.userId,
      });

      req.flash('success', `"${req.file.originalname}" uploaded successfully.`);
      res.redirect(`/projects/${req.project.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Upload failed.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // DELETE /projects/:projectId/attachments/:id
  destroy: async (req, res) => {
    try {
      const attachment = await Attachment.findOne({
        where: { id: req.params.id, projectId: req.project.id },
      });

      if (!attachment) {
        req.flash('error', 'Attachment not found.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      // Only uploader, project admin, or site admin can delete
      if (
        attachment.uploadedById !== req.session.userId &&
        !req.isProjectAdmin
      ) {
        req.flash('error', 'Not authorized to delete this file.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      // Delete file from disk
      const filePath = path.join(__dirname, '../../public/uploads', attachment.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await attachment.destroy();
      req.flash('success', `"${attachment.originalName}" deleted.`);
      res.redirect(`/projects/${req.project.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error deleting attachment.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },
};

module.exports = attachmentsController;
