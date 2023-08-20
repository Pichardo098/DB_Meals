const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Meal = db.define('meals', {
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
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'disable'),
    defaultValue: 'active',
    allowNull: false,
  },
});

const mealStatus = Object.freeze({
  active: 'active',
  inactive: 'disable',
});

module.exports = {
  Meal,
  mealStatus,
};
