const { Message, Thread } = require('../models');

const messagesController = {
  // POST /projects/:projectId/threads/:threadId/messages
  create: async (req, res) => {
    try {
      const thread = await Thread.findOne({
        where: { id: req.params.threadId, projectId: req.project.id },
      });
      if (!thread) {
        req.flash('error', 'Thread not found.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      const { body } = req.body;
      if (!body || body.trim().length === 0) {
        req.flash('error', 'Message cannot be empty.');
        return res.redirect(`/projects/${req.project.id}/threads/${thread.id}`);
      }

      await Message.create({
        body: body.trim(),
        threadId: thread.id,
        authorId: req.session.userId,
      });

      res.redirect(`/projects/${req.project.id}/threads/${thread.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error posting message.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // GET /projects/:projectId/threads/:threadId/messages/:id/edit
  edit: async (req, res) => {
    try {
      const message = await Message.findOne({
        where: { id: req.params.id, threadId: req.params.threadId },
      });
      if (!message) {
        req.flash('error', 'Message not found.');
        return res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
      }
      if (message.authorId !== req.session.userId && !req.isProjectAdmin) {
        req.flash('error', 'Not authorized.');
        return res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
      }
      res.render('messages/edit', {
        title: 'Edit Message',
        message,
        project: req.project,
        threadId: req.params.threadId,
      });
    } catch (err) {
      req.flash('error', 'Error loading message.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // PUT /projects/:projectId/threads/:threadId/messages/:id
  update: async (req, res) => {
    try {
      const message = await Message.findOne({
        where: { id: req.params.id, threadId: req.params.threadId },
      });
      if (!message) {
        req.flash('error', 'Message not found.');
        return res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
      }
      if (message.authorId !== req.session.userId && !req.isProjectAdmin) {
        req.flash('error', 'Not authorized.');
        return res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
      }

      const { body } = req.body;
      if (!body || body.trim().length === 0) {
        req.flash('error', 'Message cannot be empty.');
        return res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}/messages/${message.id}/edit`);
      }

      await message.update({ body: body.trim() });
      req.flash('success', 'Message updated.');
      res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
    } catch (err) {
      req.flash('error', 'Error updating message.');
      res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
    }
  },

  // DELETE /projects/:projectId/threads/:threadId/messages/:id
  destroy: async (req, res) => {
    try {
      const message = await Message.findOne({
        where: { id: req.params.id, threadId: req.params.threadId },
      });
      if (!message) {
        req.flash('error', 'Message not found.');
        return res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
      }
      if (message.authorId !== req.session.userId && !req.isProjectAdmin) {
        req.flash('error', 'Not authorized.');
        return res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
      }

      await message.destroy();
      res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
    } catch (err) {
      req.flash('error', 'Error deleting message.');
      res.redirect(`/projects/${req.project.id}/threads/${req.params.threadId}`);
    }
  },
};

module.exports = messagesController;
