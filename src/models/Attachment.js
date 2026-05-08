const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_name',
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  format: {
    type: DataTypes.STRING(20),
    allowNull: false, // png, jpg, pdf, txt, etc.
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'project_id',
    references: { model: 'projects', key: 'id' },
  },
  uploadedById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'uploaded_by_id',
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'attachments',
  underscored: true,
});

module.exports = Attachment;
