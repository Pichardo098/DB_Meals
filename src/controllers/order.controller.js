const { Order, orderStatus } = require('../models/order.model');
const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const { Meal, mealStatus } = require('../models/meal.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createOrder = catchAsync(async (req, res, next) => {
  const { id: userId } = req.sessionUser;
  const { quantity, mealId } = req.body;

  if (quantity <= 0) {
    return next(new AppError('The quantity must be greater than 0', 400));
  }

  const meal = await Meal.findOne({
    where: {
      id: mealId,
      status: mealStatus.active,
    },
  });

  if (!meal) {
    return next(new AppError(`Meal with id: ${mealId}, not found`, 400));
  }

  const totalPrice = (quantity * meal.price).toFixed(2);

  const order = await Order.create({
    mealId: meal.id,
    userId,
    totalPrice,
    quantity,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Order has been created',
    order,
  });
});

exports.findMyOrders = catchAsync(async (req, res, next) => {
  const { id: userId } = req.sessionUser;

  const orders = await Order.findAll({
    where: {
      userId,
      status: orderStatus.active,
    },
    include: [
      {
        model: Meal,
        where: {
          status: mealStatus.active,
        },
        include: {
          model: Restaurant,
        },
      },
    ],
  });

  return res.status(200).json({
    status: 'success',
    results: orders.length,
    orders,
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const { order } = req;

  await order.update({ status: orderStatus.completed });

  return res.status(200).json({
    status: 'success',
    message: `Order with id:${order.id}, has been completed`,
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { order } = req;

  await order.update({ status: orderStatus.cancelled });

  return res.status(200).json({
    status: 'success',
    message: `Order with id:${order.id}, has been deleted`,
  });
});
