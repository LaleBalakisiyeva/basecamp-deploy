const { Project, ProjectMember } = require('../models');

/**
 * Loads req.project and req.membership for project-scoped routes.
 * req.isProjectAdmin = true if user is project owner OR has admin role in membership OR is site admin.
 * req.isProjectMember = true if user is member or owner.
 */
const loadProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findByPk(projectId);

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

    req.project = project;
    req.membership = membership;
    req.isProjectAdmin = isProjectAdmin;
    req.isProjectMember = isProjectMember;

    next();
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading project.');
    res.redirect('/projects');
  }
};

const requireProjectMember = (req, res, next) => {
  if (!req.isProjectMember) {
    req.flash('error', 'You are not a member of this project.');
    return res.redirect('/projects');
  }
  next();
};

const requireProjectAdmin = (req, res, next) => {
  if (!req.isProjectAdmin) {
    req.flash('error', 'Only project admins can do this.');
    return res.redirect(`/projects/${req.project.id}`);
  }
  next();
};

module.exports = { loadProject, requireProjectMember, requireProjectAdmin };
