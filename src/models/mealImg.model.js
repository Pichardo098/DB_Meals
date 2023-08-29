const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const MealImg = db.define('mealImgs', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  mealImgUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mealId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'disabled'),
    allowNull: false,
    defaultValue: 'active',
  },
});

const statusMealImg = Object.freeze({
  active: 'active',
  inactive: 'disabled',
});

module.exports = { MealImg, statusMealImg };
