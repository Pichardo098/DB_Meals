const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Restaurant = db.define('restaurants', {
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
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('active', 'disable'),
    defaultValue: 'active',
    allowNull: false,
  },
});

const restaurantStatus = Object.freeze({
  active: 'active',
  inactive: 'disable',
});

module.exports = {
  Restaurant,
  restaurantStatus,
};
