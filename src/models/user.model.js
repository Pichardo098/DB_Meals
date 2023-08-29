const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const User = db.define('users', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userProfileImg: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: process.env.FIREBASE_IMG_DEFAULT_USER,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('normal', 'admin'),
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
});

const userStatus = Object.freeze({
  active: 'active',
  inactive: 'inactive',
});

module.exports = {
  User,
  userStatus,
};
