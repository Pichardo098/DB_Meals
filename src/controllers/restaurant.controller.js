const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const { Review, reviewStatus } = require('../models/review.model');
const catchAsync = require('../utils/catchAsync');
const storage = require('../utils/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

exports.createRestaurant = catchAsync(async (req, res, next) => {
  const { name, address } = req.body;

  let restaurantImg;

  if (req.file?.buffer) {
    const imgRef = ref(
      storage,
      `restaurants/${Date.now()}-${req.file?.originalname}`
    );
    const imgUpload = await uploadBytes(imgRef, req.file?.buffer);
    restaurantImg = imgUpload.metadata.fullPath;
  }

  const restaurant = await Restaurant.create({
    name,
    address,
    restaurantImg,
  });

  const imgRefRestaurant = ref(storage, restaurant.restaurantImg);
  const url = await getDownloadURL(imgRefRestaurant);

  restaurant.restaurantImg = url;

  return res.status(200).json({
    status: 'success',
    message: 'Restaurant has been created',
    restaurant,
  });
});

exports.findAllRestaurants = catchAsync(async (req, res, next) => {
  const restaurants = await Restaurant.findAll({
    where: {
      status: restaurantStatus.active,
    },
    include: [
      {
        model: Review,
        attributes: {
          exclude: ['restaurantId', 'status'],
        },
      },
    ],
  });

  const imgRestPromise = restaurants.map(async (restaurant) => {
    const imgRef = ref(storage, restaurant.restaurantImg);
    const url = await getDownloadURL(imgRef);

    restaurant.restaurantImg = url;
    return restaurant;
  });

  await Promise.all(imgRestPromise);

  return res.status(200).json({
    status: 'success',
    results: restaurants.length,
    restaurants,
  });
});

exports.findOneRestaurant = catchAsync(async (req, res, next) => {
  const { restaurant } = req;

  const imgRefRestaurant = ref(storage, restaurant.restaurantImg);
  const url = await getDownloadURL(imgRefRestaurant);

  restaurant.restaurantImg = url;

  return res.status(200).json({
    status: 'success',
    message: 'Restaurant restrieved successfully',
    restaurant,
  });
});

exports.updateRestaurant = catchAsync(async (req, res, next) => {
  const { restaurant } = req;
  const { name, address } = req.body;

  await restaurant.update({ name, address });

  return res.status(201).json({
    status: 'success',
    message: 'Restaurant has been updated',
  });
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const { restaurant } = req;

  await restaurant.update({ status: restaurantStatus.inactive });

  return res.status(200).json({
    status: 'success',
    message: `Restaurant with id: ${restaurant.id}, has been deleted`,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const { restaurant } = req;
  const { id: userId } = req.sessionUser;
  const { comment, rating } = req.body;

  const review = await Review.create({
    userId,
    comment,
    restaurantId: restaurant.id,
    rating,
  });

  const ratingRestaurant = ((review.rating + restaurant.rating) / 2).toFixed(1);

  await restaurant.update({ rating: ratingRestaurant });

  return res.status(200).json({
    status: 'success',
    message: `Review to restaurant: ${restaurant.id}, has been created`,
    review,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { restaurant, review } = req;
  const { comment, rating } = req.body;

  const ratingRestaurant = ((review.rating + restaurant.rating) / 2).toFixed(1);

  const updateRestaurant = restaurant.update({
    rating: ratingRestaurant,
  });

  const updateReview = review.update({
    comment,
    rating,
  });

  await Promise.all([updateRestaurant, updateReview]);

  return res.status(200).json({
    status: 'success',
    message: `Review with id: ${review.id}, has been updated`,
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { review } = req;

  await review.update({ status: reviewStatus.inactive });

  return res.status(200).json({
    status: 'success',
    message: `Review with id: ${review.id}, has been deleted`,
  });
});
