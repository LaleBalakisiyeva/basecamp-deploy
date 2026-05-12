require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');
const { syncDatabase } = require('./src/models');
const { setLocals } = require('./src/middleware/auth');

const authRoutes = require('./src/routes/auth');
const usersRoutes = require('./src/routes/users');
const projectsRoutes = require('./src/routes/projects');
const adminRoutes = require('./src/routes/admin');
const attachmentsRoutes = require('./src/routes/attachments');
const threadsRoutes = require('./src/routes/threads');
const membersRoutes = require('./src/routes/members');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use(flash());
app.use(setLocals);

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/projects');
  res.render('home', { title: 'Welcome' });
});

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/projects', projectsRoutes);
app.use('/admin', adminRoutes);
app.use('/projects/:projectId/attachments', attachmentsRoutes);
app.use('/projects/:projectId/threads', threadsRoutes);
app.use('/projects/:projectId/members', membersRoutes);

app.use((req, res) => res.status(404).render('home', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong.');
});

const start = async () => {
  try {
    await syncDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 MyBasecamp running at http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
};

start();
