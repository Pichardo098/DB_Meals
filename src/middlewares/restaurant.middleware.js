const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const { Review, reviewStatus } = require('../models/review.model');
const { User } = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.validRestaurant = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const restaurant = await Restaurant.findOne({
    where: {
      id,
      status: restaurantStatus.active,
    },
    include: {
      model: Review,
      attributes: {
        exclude: ['restaurantId', 'status'],
      },
    },
  });

  if (!restaurant) {
    return next(new AppError(`Restaurant with id: ${id} not found`, 400));
  }

  req.restaurant = restaurant;
  next();
});

exports.validRestaurantAndReview = catchAsync(async (req, res, next) => {
  const { restaurantId, id } = req.params;
  const { id: userId } = req.sessionUser;

  const review = await Review.findOne({
    where: {
      id,
      restaurantId,
      status: reviewStatus.active,
    },
    include: [
      {
        model: Restaurant,
      },
      {
        model: User,
      },
    ],
  });

  if (!review) {
    return next(new AppError(`Review with id: ${id} not found`, 400));
  }

  req.restaurant = review.restaurant;
  req.review = review;
  req.user = review.user;
  next();
});
