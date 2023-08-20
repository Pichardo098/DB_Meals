const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Review = db.define('reviews', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'disable'),
    defaultValue: 'active',
    allowNull: false,
  },
});

const reviewStatus = Object.freeze({
  active: 'active',
  inactive: 'disable',
});

module.exports = {
  Review,
  reviewStatus,
};
