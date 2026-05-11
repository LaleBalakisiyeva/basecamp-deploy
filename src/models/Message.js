const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true },
  },
  threadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'thread_id',
    references: { model: 'threads', key: 'id' },
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id',
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'messages',
  underscored: true,
});

module.exports = Message;
