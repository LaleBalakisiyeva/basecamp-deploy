const { User } = require('../models');

const authController = {
  // GET /auth/register
  newUser: (req, res) => {
    res.render('auth/register', { title: 'Create Account' });
  },

  // POST /auth/register
  createUser: async (req, res) => {
    try {
      const { username, email, password, confirmPassword } = req.body;

      if (!username || !email || !password) {
        req.flash('error', 'All fields are required.');
        return res.redirect('/auth/register');
      }
      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.redirect('/auth/register');
      }
      if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        return res.redirect('/auth/register');
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        req.flash('error', 'Email already in use.');
        return res.redirect('/auth/register');
      }

      const user = await User.create({ username, email, passwordHash: password });

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = user.isAdmin;

      req.flash('success', `Welcome to MyBasecamp, ${user.username}!`);
      res.redirect('/projects');
    } catch (err) {
      if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        req.flash('error', err.errors.map(e => e.message).join(', '));
      } else {
        req.flash('error', 'Registration failed. Please try again.');
      }
      res.redirect('/auth/register');
    }
  },

  // GET /auth/sign-in
  signInPage: (req, res) => {
    res.render('auth/sign-in', { title: 'Sign In' });
  },

  // POST /auth/sign-in
  signIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/auth/sign-in');
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/auth/sign-in');
      }

      const valid = await user.validatePassword(password);
      if (!valid) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/auth/sign-in');
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.isAdmin = user.isAdmin;

      req.flash('success', `Welcome back, ${user.username}!`);
      res.redirect('/projects');
    } catch (err) {
      req.flash('error', 'Sign in failed. Please try again.');
      res.redirect('/auth/sign-in');
    }
  },

  // POST /auth/sign-out
  signOut: (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
      res.redirect('/auth/sign-in');
    });
  },
};

module.exports = authController;
