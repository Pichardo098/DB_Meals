const { Meal, mealStatus } = require('../models/meal.model');
const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const catchAsync = require('../utils/catchAsync');
const storage = require('../utils/firebase');
const { ref, getDownloadURL } = require('firebase/storage');

exports.createMeal = catchAsync(async (req, res, next) => {
  const { id: restaurantId } = req.restaurant;
  const { name, price } = req.body;

  const meal = await Meal.create({
    name,
    price,
    restaurantId,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Meal has been created',
    meal,
  });
});

exports.findAllMeals = catchAsync(async (req, res, next) => {
  const meals = await Meal.findAll({
    where: {
      status: mealStatus.active,
    },
    include: [
      {
        model: Restaurant,
      },
    ],
  });

  const mealsPromises = meals.map(async (meal) => {
    const imgRef = ref(storage, meal.restaurant.restaurantImg);
    const url = await getDownloadURL(imgRef);

    meal.restaurant.restaurantImg = url;
    return meal;
  });

  await Promise.all(mealsPromises);

  return res.status(200).json({
    status: 'success',
    results: meals.length,
    meals,
  });
});

exports.findOneMeal = catchAsync(async (req, res, next) => {
  const { meal } = req;

  const imgRef = ref(storage, meal.restaurant.restaurantImg);
  const url = await getDownloadURL(imgRef);

  meal.restaurant.restaurantImg = url;

  return res.status(200).json({
    status: 'success',
    message: 'Meal retrieved successfully',
    meal,
  });
});

exports.updateMeal = catchAsync(async (req, res, next) => {
  const { meal } = req;
  const { name, price } = req.body;

  await meal.update({ name, price });

  return res.status(200).json({
    status: 'success',
    message: `Meal with id:${meal.id}, has been updated`,
  });
});

exports.deleteMeal = catchAsync(async (req, res, next) => {
  const { meal } = req;

  await meal.update({ status: mealStatus.inactive });

  return res.status(200).json({
    status: 'success',
    message: `Meal with id:${meal.id}, has been deleted`,
  });
});
