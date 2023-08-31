const { Meal, mealStatus } = require('../models/meal.model');
const { MealImg } = require('../models/mealImg.model');
const { Order, orderStatus } = require('../models/order.model');
const { ref, getDownloadURL } = require('firebase/storage');
const { Restaurant } = require('../models/restaurant.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const storage = require('../utils/firebase');

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
        attributes: {
          exclude: ['status', 'userId'],
        },
        where: {
          status: mealStatus.active,
        },
        include: [
          {
            model: Restaurant,
            attributes: ['id', 'name', 'address', 'restaurantImg'],
          },
          {
            model: MealImg,
          },
        ],
      },
    ],
  });

  const ordersPromises = orders.map(async (order) => {
    const mealImgsPromises = order.meal.mealImgs.map(async (meal) => {
      const imgRef = ref(storage, meal.mealImgUrl);
      const url = await getDownloadURL(imgRef);
      meal.mealImgUrl = url;
      return meal;
    });

    await Promise.all(mealImgsPromises);

    const imgRef = ref(storage, order.meal.restaurant.restaurantImg);
    const url = await getDownloadURL(imgRef);

    order.meal.restaurant.restaurantImg = url;

    return order;
  });

  await Promise.all(ordersPromises);

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
