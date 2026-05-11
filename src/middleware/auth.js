const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please sign in to access this page.');
    return res.redirect('/auth/sign-in');
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please sign in.');
    return res.redirect('/auth/sign-in');
  }
  if (!req.session.isAdmin) {
    req.flash('error', 'Admin access required.');
    return res.redirect('/projects');
  }
  next();
};

const requireGuest = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/projects');
  }
  next();
};

const setLocals = (req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentUsername = req.session.username || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  res.locals.flashSuccess = req.flash('success');
  res.locals.flashError = req.flash('error');
  next();
};

module.exports = { requireAuth, requireAdmin, requireGuest, setLocals };
