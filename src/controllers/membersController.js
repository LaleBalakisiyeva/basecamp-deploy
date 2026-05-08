const { User, ProjectMember } = require('../models');

const membersController = {
  // POST /projects/:projectId/members
  add: async (req, res) => {
    try {
      const { email, role } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        req.flash('error', `No user found with email "${email}".`);
        return res.redirect(`/projects/${req.project.id}`);
      }

      if (user.id === req.project.ownerId) {
        req.flash('error', 'Project owner is already an admin member.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      const [member, created] = await ProjectMember.findOrCreate({
        where: { projectId: req.project.id, userId: user.id },
        defaults: { role: role === 'admin' ? 'admin' : 'member' },
      });

      if (!created) {
        await member.update({ role: role === 'admin' ? 'admin' : 'member' });
        req.flash('success', `${user.username}'s role updated to ${member.role}.`);
      } else {
        req.flash('success', `${user.username} added as ${member.role}.`);
      }

      res.redirect(`/projects/${req.project.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Error adding member.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },

  // DELETE /projects/:projectId/members/:userId
  remove: async (req, res) => {
    try {
      if (parseInt(req.params.userId) === req.project.ownerId) {
        req.flash('error', 'Cannot remove the project owner.');
        return res.redirect(`/projects/${req.project.id}`);
      }

      const deleted = await ProjectMember.destroy({
        where: { projectId: req.project.id, userId: req.params.userId },
      });

      if (deleted) {
        req.flash('success', 'Member removed.');
      } else {
        req.flash('error', 'Member not found.');
      }
      res.redirect(`/projects/${req.project.id}`);
    } catch (err) {
      req.flash('error', 'Error removing member.');
      res.redirect(`/projects/${req.project.id}`);
    }
  },
};

module.exports = membersController;
