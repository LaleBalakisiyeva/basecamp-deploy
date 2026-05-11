const { Thread, Message, User, Project } = require('../models');

const threadsController = {
  // GET /projects/:projectId/threads/new
  newThread: (req, res) => {
    res.render('threads/new', {
      title: 'New Discussion Thread',
      project: req.project,
    });
  },

  // POST /projects/:projectId/threads
  create: async (req, res) => {
    try {
      const { title } = req.body;
      if (!title || title.trim().length < 2) {
        req.flash('error', 'Thread title must be at least 2 characters.');
        return res.redirect(`/projects/${req.project.id}/threads/new`);
      }

      const thread = await Thread.create({
        title: title.trim(),
        projectId: req.project.id,
        createdById: req.session.userId,
      });

      req.flash('success', `Thread "${thread.title}" created.`);
      res.redirect(`/projects/${req.project.id}/threads/${thread.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error creating thread.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // GET /projects/:projectId/threads/:id
  show: async (req, res) => {
    try {
      const thread = await Thread.findOne({
        where: { id: req.params.id, projectId: req.project.id },
        include: [
          { model: User, as: 'creator', attributes: ['id', 'username'] },
          {
            model: Message,
            as: 'messages',
            include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      if (!thread) {
        req.flash('error', 'Thread not found.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      res.render('threads/show', {
        title: thread.title,
        thread,
        project: req.project,
        isProjectAdmin: req.isProjectAdmin,
        isProjectMember: req.isProjectMember,
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error loading thread.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // GET /projects/:projectId/threads/:id/edit
  edit: async (req, res) => {
    try {
      const thread = await Thread.findOne({
        where: { id: req.params.id, projectId: req.project.id },
      });
      if (!thread) {
        req.flash('error', 'Thread not found.');
        return res.redirect(`/projects/${req.project.id}`);
      }
      res.render('threads/edit', { title: 'Edit Thread', thread, project: req.project });
    } catch (err) {
      req.flash('error', 'Error loading thread.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // PUT /projects/:projectId/threads/:id
  update: async (req, res) => {
    try {
      const thread = await Thread.findOne({
        where: { id: req.params.id, projectId: req.project.id },
      });
      if (!thread) {
        req.flash('error', 'Thread not found.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      const { title } = req.body;
      if (!title || title.trim().length < 2) {
        req.flash('error', 'Title must be at least 2 characters.');
        return res.redirect(`/projects/${req.project.id}/threads/${thread.id}/edit`);
      }

      await thread.update({ title: title.trim() });
      req.flash('success', 'Thread updated.');
      res.redirect(`/projects/${req.project.id}/threads/${thread.id}`);
    } catch (err) {
      req.flash('error', 'Error updating thread.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // DELETE /projects/:projectId/threads/:id
  destroy: async (req, res) => {
    try {
      const thread = await Thread.findOne({
        where: { id: req.params.id, projectId: req.project.id },
      });
      if (!thread) {
        req.flash('error', 'Thread not found.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      await thread.destroy();
      req.flash('success', `Thread "${thread.title}" deleted.`);
      res.redirect(`/projects/${req.project.id}`);
    } catch (err) {
      req.flash('error', 'Error deleting thread.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },
};

module.exports = threadsController;
