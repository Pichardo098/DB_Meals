const { Meal, mealStatus } = require('../models/meal.model');
const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const { MealImg, statusMealImg } = require('../models/mealImg.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.validMeal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const meal = await Meal.findOne({
    where: {
      id,
      status: mealStatus.active,
    },
    include: [
      {
        model: Restaurant,
      },
      {
        model: MealImg,
        attributes: ['id', 'mealImgUrl'],
      },
    ],
  });

  if (!meal) {
    return next(new AppError(`Meal with id:${id}, not found`, 400));
  }

  req.meal = meal;
  next();
});
