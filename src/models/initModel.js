const { User } = require('./user.model');
const { Restaurant } = require('./restaurant.model');
const { Review } = require('./review.model');
const { Meal } = require('./meal.model');
const { Order } = require('./order.model');

const initModel = () => {
  Restaurant.hasMany(Meal, { foreignKey: 'restaurantId' });
  Meal.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

  Restaurant.hasMany(Review, { foreignKey: 'restaurantId' });
  Review.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

  Meal.hasOne(Order, { foreignKey: 'mealId' });
  Order.belongsTo(Meal, { foreignKey: 'mealId' });

  User.hasMany(Review, { foreignKey: 'userId' });
  Review.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Order, { foreignKey: 'userId' });
  Order.belongsTo(User, { foreignKey: 'userId' });
};

module.exports = initModel;
