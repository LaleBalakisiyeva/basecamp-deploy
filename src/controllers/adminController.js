const { User, Project } = require('../models');

const adminController = {
  // GET /admin
  dashboard: async (req, res) => {
    try {
      const [userCount, projectCount, users] = await Promise.all([
        User.count(),
        Project.count(),
        User.findAll({
          include: [{ model: Project, as: 'projects' }],
          order: [['createdAt', 'DESC']],
          limit: 5,
        }),
      ]);
      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        userCount,
        projectCount,
        users,
      });
    } catch (err) {
      req.flash('error', 'Error loading dashboard.');
      res.redirect('/projects');
    }
  },

  // GET /admin/users
  listUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        include: [{ model: Project, as: 'projects' }],
        order: [['createdAt', 'DESC']],
      });
      res.render('admin/users', { title: 'Manage Users', users });
    } catch (err) {
      req.flash('error', 'Error loading users.');
      res.redirect('/admin');
    }
  },

  // PATCH /admin/users/:id/set-admin
  setAdmin: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/admin/users');
      }
      await user.update({ isAdmin: true });
      req.flash('success', `${user.username} is now an admin.`);
      res.redirect('/admin/users');
    } catch (err) {
      req.flash('error', 'Error updating user.');
      res.redirect('/admin/users');
    }
  },

  // PATCH /admin/users/:id/remove-admin
  removeAdmin: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/admin/users');
      }

      // Prevent self-demotion
      if (user.id === req.session.userId) {
        req.flash('error', 'You cannot remove your own admin role.');
        return res.redirect('/admin/users');
      }

      await user.update({ isAdmin: false });
      req.flash('success', `Admin role removed from ${user.username}.`);
      res.redirect('/admin/users');
    } catch (err) {
      req.flash('error', 'Error updating user.');
      res.redirect('/admin/users');
    }
  },

  // GET /admin/projects
  listProjects: async (req, res) => {
    try {
      const projects = await Project.findAll({
        include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
        order: [['createdAt', 'DESC']],
      });
      res.render('admin/projects', { title: 'All Projects', projects });
    } catch (err) {
      req.flash('error', 'Error loading projects.');
      res.redirect('/admin');
    }
  },
};

module.exports = adminController;
