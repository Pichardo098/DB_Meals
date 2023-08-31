const { Meal, mealStatus } = require('../models/meal.model');
const { MealImg, statusMealImg } = require('../models/mealImg.model');
const { Order, orderStatus } = require('../models/order.model');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const { User, userStatus } = require('../models/user.model');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const generateJWT = require('../utils/jwt');
const storage = require('../utils/firebase');

exports.signupUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  let userProfileImg;

  if (req.file) {
    const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);
    const imgUpload = await uploadBytes(imgRef, req.file.buffer);

    userProfileImg = imgUpload.metadata.fullPath;
  }

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password: encryptedPassword,
    role,
    userProfileImg,
  });

  const imgRef = ref(storage, user.userProfileImg);
  const urlPromise = getDownloadURL(imgRef);

  const tokenPromise = generateJWT(user.id);

  const [url, token] = await Promise.all([urlPromise, tokenPromise]);

  const roleUser = user.role ?? 'This user has not role';

  return res.status(200).json({
    status: 'success',
    message: 'User has been created',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleUser,
      userProfileImg: url,
    },
  });
});
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email,
      status: userStatus.active,
    },
  });

  if (!user) {
    return next(new AppError(`User with email: ${email} not found`, 400));
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Email or password is wrong', 401));
  }

  const imgRef = ref(storage, user.userProfileImg);
  const urlPromise = getDownloadURL(imgRef);

  const tokenPromise = generateJWT(user.id);

  const [url, token] = await Promise.all([urlPromise, tokenPromise]);

  const roleUser = user.role ?? 'This user has not role';

  return res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleUser,
      userProfileImg: url,
    },
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { name, newPassword, currentPassword } = req.body;

  let userProfileImg;

  if (req.file) {
    const imgRef = ref(storage, `users/${Date.now()}-${req.file.originalname}`);
    const upload = await uploadBytes(imgRef, req.file.buffer);

    userProfileImg = upload.metadata.fullPath;
  }

  if (newPassword === currentPassword) {
    return next(new AppError('The new password cannot be equals', 400));
  }

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('The password is wrong', 401));
  }

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(newPassword, salt);

  await user.update({
    name: name.toLowerCase().trim(),
    password: encryptedPassword,
    userProfileImg,
  });

  return res.status(200).json({
    status: 'success',
    message: 'User has been updated',
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: userStatus.inactive });

  return res.status(200).json({
    status: 'success',
    message: `User with id: ${user.id} has been deleted`,
  });
});
//TODO: Resolve url of the MEALS
exports.getAllOrdersUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const orders = await Order.findAll({
    where: {
      userId: sessionUser.id,
      status: orderStatus.active,
    },
    attributes: {
      exclude: ['status'],
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
exports.getDetailOneOrder = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const order = await Order.findOne({
    where: {
      id,
      userId: sessionUser.id,
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

  if (!order) {
    return next(new AppError(`Order with id: ${id} not found`, 400));
  }

  const mealImgsPromises = order.meal.mealImgs.map(async (mealImg) => {
    const imgRef = ref(storage, mealImg.mealImgUrl);
    const url = await getDownloadURL(imgRef);

    mealImg.mealImgUrl = url;
    return mealImg;
  });

  const imgRestRef = ref(storage, order.meal.restaurant.restaurantImg);
  const imgUrlRestPromise = getDownloadURL(imgRestRef);

  const [mealImgs, imgUrlRest] = await Promise.all([
    ...mealImgsPromises,
    imgUrlRestPromise,
  ]);

  order.meal.mealImgs = mealImgs;
  order.meal.restaurant.restaurantImg = imgUrlRest;

  return res.status(200).json({
    status: 'success',
    message: 'Order retrieved successfully',
    order,
  });
});
