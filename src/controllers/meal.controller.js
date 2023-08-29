const { Meal, mealStatus } = require('../models/meal.model');
const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const catchAsync = require('../utils/catchAsync');
const storage = require('../utils/firebase');
const { ref, getDownloadURL, uploadBytes } = require('firebase/storage');
const { MealImg, statusMealImg } = require('../models/mealImg.model');

exports.createMeal = catchAsync(async (req, res, next) => {
  const { id: restaurantId } = req.restaurant;
  const { name, price } = req.body;

  const meal = await Meal.create({
    name,
    price,
    restaurantId,
  });

  if (req.files.length > 0) {
    const mealImgsPromises = req.files.map(async (file) => {
      const imgRef = ref(
        storage,
        `mealImgs/${Date.now()}-${file.originalname}`
      );
      const upload = await uploadBytes(imgRef, file.buffer);

      return await MealImg.create({
        mealId: meal.id,
        mealImgUrl: upload.metadata.fullPath,
      });
    });

    await Promise.all(mealImgsPromises);
  }

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
      {
        model: MealImg,
      },
    ],
  });

  const mealsPromises = meals.map(async (meal) => {
    const imgRef = ref(storage, meal.restaurant.restaurantImg);
    const urlPromise = getDownloadURL(imgRef);

    const mealImgsPromises = meal.mealImgs.map(async (mealImg) => {
      const imgRef = ref(storage, mealImg.mealImgUrl);
      const url = await getDownloadURL(imgRef);

      mealImg.mealImgUrl = url;

      return mealImg;
    });

    const [resolveImgs, url] = await Promise.all([
      ...mealImgsPromises,
      urlPromise,
    ]);

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

  let mealImgsPromises = [];

  if (meal.mealImgs.length > 0) {
    mealImgsPromises = meal.mealImgs.map(async (mealImg) => {
      const imgRef = ref(storage, mealImg.mealImgUrl);
      const url = await getDownloadURL(imgRef);

      mealImg.mealImgUrl = url;

      return mealImg;
    });

    await Promise.all(mealImgsPromises);
  }

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
