const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Attachment = require('./Attachment');
const Thread = require('./Thread');
const Message = require('./Message');

// Project <-> User (owner)
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects', onDelete: 'CASCADE' });
Project.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Project <-> User (members)
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'projectId', otherKey: 'userId', as: 'members' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'userId', otherKey: 'projectId', as: 'memberProjects' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'memberships' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Attachments
Project.hasMany(Attachment, { foreignKey: 'projectId', as: 'attachments', onDelete: 'CASCADE' });
Attachment.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
User.hasMany(Attachment, { foreignKey: 'uploadedById', as: 'attachments' });
Attachment.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploader' });

// Threads
Project.hasMany(Thread, { foreignKey: 'projectId', as: 'threads', onDelete: 'CASCADE' });
Thread.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
User.hasMany(Thread, { foreignKey: 'createdById', as: 'threads' });
Thread.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Messages
Thread.hasMany(Message, { foreignKey: 'threadId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Thread, { foreignKey: 'threadId', as: 'thread' });
User.hasMany(Message, { foreignKey: 'authorId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    throw error;
  }
};

module.exports = { sequelize, User, Project, ProjectMember, Attachment, Thread, Message, syncDatabase };
