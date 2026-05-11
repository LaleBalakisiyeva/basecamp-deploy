require('dotenv').config();
const { User, Project, ProjectMember, Thread, Message, syncDatabase } = require('./src/models');

const seed = async () => {
  await syncDatabase();

  const [admin] = await User.findOrCreate({
    where: { email: 'admin@mybasecamp.com' },
    defaults: { username: 'admin', email: 'admin@mybasecamp.com', passwordHash: 'admin123', isAdmin: true },
  });

  const [demo] = await User.findOrCreate({
    where: { email: 'demo@mybasecamp.com' },
    defaults: { username: 'demouser', email: 'demo@mybasecamp.com', passwordHash: 'demo123', isAdmin: false },
  });

  const [project] = await Project.findOrCreate({
    where: { name: 'Website Redesign' },
    defaults: { name: 'Website Redesign', description: 'Complete overhaul of the company website.', color: '#3b82f6', ownerId: admin.id },
  });

  // Admin is project admin member, demo is regular member
  await ProjectMember.findOrCreate({ where: { projectId: project.id, userId: admin.id }, defaults: { role: 'admin' } });
  await ProjectMember.findOrCreate({ where: { projectId: project.id, userId: demo.id }, defaults: { role: 'member' } });

  // Create a thread
  const [thread] = await Thread.findOrCreate({
    where: { title: 'Design direction discussion', projectId: project.id },
    defaults: { title: 'Design direction discussion', projectId: project.id, createdById: admin.id },
  });

  await Message.findOrCreate({
    where: { body: 'I think we should go with a clean minimalist approach.', threadId: thread.id },
    defaults: { body: 'I think we should go with a clean minimalist approach.', threadId: thread.id, authorId: admin.id },
  });
  await Message.findOrCreate({
    where: { body: 'Agreed! Maybe we can look at some modern references?', threadId: thread.id },
    defaults: { body: 'Agreed! Maybe we can look at some modern references?', threadId: thread.id, authorId: demo.id },
  });

  console.log('\n✅ Seed complete!');
  console.log('   Admin:   admin@mybasecamp.com / admin123');
  console.log('   Demo:    demo@mybasecamp.com / demo123\n');
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
