const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Thread = sequelize.define('Thread', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { len: [2, 150], notEmpty: true },
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'project_id',
    references: { model: 'projects', key: 'id' },
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by_id',
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'threads',
  underscored: true,
});

module.exports = Thread;
