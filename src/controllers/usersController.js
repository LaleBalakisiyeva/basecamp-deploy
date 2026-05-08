const { User, Project } = require('../models');

const usersController = {
  // GET /users/:id
  show: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{ model: Project, as: 'projects' }],
      });
      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/projects');
      }
      res.render('users/show', { title: `${user.username}'s Profile`, user });
    } catch (err) {
      req.flash('error', 'Error loading user.');
      res.redirect('/projects');
    }
  },

  // DELETE /users/:id  (self-delete or admin)
  destroy: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/admin/users');
      }

      // Only self or admin can delete
      if (req.session.userId !== user.id && !req.session.isAdmin) {
        req.flash('error', 'Not authorized.');
        return res.redirect('/projects');
      }

      await user.destroy();

      if (req.session.userId === user.id) {
        req.session.destroy();
        return res.redirect('/auth/sign-in');
      }

      req.flash('success', `User "${user.username}" deleted.`);
      res.redirect('/admin/users');
    } catch (err) {
      req.flash('error', 'Error deleting user.');
      res.redirect('/admin/users');
    }
  },
};

module.exports = usersController;
