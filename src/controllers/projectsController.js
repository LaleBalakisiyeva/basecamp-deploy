const { Project, User, ProjectMember, Attachment, Thread } = require('../models');

const projectsController = {
  index: async (req, res) => {
    try {
      // Projects user owns OR is a member of
      const ownedProjects = await Project.findAll({
        where: { ownerId: req.session.userId },
        include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
        order: [['createdAt', 'DESC']],
      });

      const memberProjects = await Project.findAll({
        include: [
          { model: User, as: 'owner', attributes: ['id', 'username'] },
          {
            model: User,
            as: 'members',
            where: { id: req.session.userId },
            attributes: [],
            through: { attributes: [] },
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Merge and deduplicate
      const seen = new Set();
      const projects = [...ownedProjects, ...memberProjects].filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      res.render('projects/index', { title: 'My Projects', projects });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error loading projects.');
      res.render('projects/index', { title: 'My Projects', projects: [] });
    }
  },

  newProject: (req, res) => {
    res.render('projects/new', { title: 'New Project' });
  },

  create: async (req, res) => {
    try {
      const { name, description, color } = req.body;
      if (!name || name.trim().length < 2) {
        req.flash('error', 'Project name must be at least 2 characters.');
        return res.redirect('/projects/new');
      }
      const project = await Project.create({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3b82f6',
        ownerId: req.session.userId,
      });
      // Auto-add owner as project admin member
      await ProjectMember.create({
        projectId: project.id,
        userId: req.session.userId,
        role: 'admin',
      });
      req.flash('success', `Project "${project.name}" created!`);
      res.redirect(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error creating project.');
      res.redirect('/projects/new');
    }
  },

  show: async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.id, {
        include: [
          { model: User, as: 'owner', attributes: ['id', 'username'] },
          {
            model: Attachment,
            as: 'attachments',
            include: [{ model: User, as: 'uploader', attributes: ['id', 'username'] }],
            order: [['createdAt', 'DESC']],
          },
          {
            model: Thread,
            as: 'threads',
            include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
            order: [['createdAt', 'DESC']],
          },
          {
            model: ProjectMember,
            as: 'memberships',
            include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
          },
        ],
      });

      if (!project) {
        req.flash('error', 'Project not found.');
        return res.redirect('/projects');
      }

      const isOwner = project.ownerId === req.session.userId;
      const isSiteAdmin = req.session.isAdmin;
      const membership = await ProjectMember.findOne({
        where: { projectId: project.id, userId: req.session.userId },
      });
      const isProjectAdmin = isOwner || isSiteAdmin || (membership && membership.role === 'admin');
      const isProjectMember = isOwner || isSiteAdmin || !!membership;

      if (!isProjectMember) {
        req.flash('error', 'Access denied.');
        return res.redirect('/projects');
      }

      res.render('projects/show', {
        title: project.name,
        project,
        isProjectAdmin,
        isProjectMember,
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error loading project.');
      res.redirect('/projects');
    }
  },

  edit: async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        req.flash('error', 'Project not found.');
        return res.redirect('/projects');
      }
      const isOwner = project.ownerId === req.session.userId;
      if (!isOwner && !req.session.isAdmin) {
        req.flash('error', 'Access denied.');
        return res.redirect('/projects');
      }
      res.render('projects/edit', { title: `Edit ${project.name}`, project });
    } catch (err) {
      req.flash('error', 'Error loading project.');
      res.redirect('/projects');
    }
  },

  update: async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        req.flash('error', 'Project not found.');
        return res.redirect('/projects');
      }
      if (project.ownerId !== req.session.userId && !req.session.isAdmin) {
        req.flash('error', 'Access denied.');
        return res.redirect('/projects');
      }
      const { name, description, color } = req.body;
      if (!name || name.trim().length < 2) {
        req.flash('error', 'Project name must be at least 2 characters.');
        return res.redirect(`/projects/${project.id}/edit`);
      }
      await project.update({ name: name.trim(), description: description?.trim() || null, color: color || project.color });
      req.flash('success', 'Project updated!');
      res.redirect(`/projects/${project.id}`);
    } catch (err) {
      req.flash('error', 'Error updating project.');
      res.redirect(`/projects/${req.params.id}/edit`);
    }
  },

  destroy: async (req, res) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) {
        req.flash('error', 'Project not found.');
        return res.redirect('/projects');
      }
      if (project.ownerId !== req.session.userId && !req.session.isAdmin) {
        req.flash('error', 'Access denied.');
        return res.redirect('/projects');
      }
      const name = project.name;
      await project.destroy();
      req.flash('success', `Project "${name}" deleted.`);
      res.redirect('/projects');
    } catch (err) {
      req.flash('error', 'Error deleting project.');
      res.redirect('/projects');
    }
  },
};

module.exports = projectsController;
