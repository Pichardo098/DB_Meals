const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Order = db.define('orders', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  mealId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'completed'),
    allowNull: false,
    defaultValue: 'active',
  },
});

const orderStatus = Object.freeze({
  active: 'active',
  cancelled: 'cancelled',
  completed: 'completed',
});

module.exports = {
  Order,
  orderStatus,
};
