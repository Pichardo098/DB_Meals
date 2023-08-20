const { User, userStatus } = require('../models/user.model');
const { Order, orderStatus } = require('../models/order.model');
const { Restaurant, restaurantStatus } = require('../models/restaurant.model');
const { Meal, mealtStatus } = require('../models/meal.model');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/appError');

exports.signupUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password: encryptedPassword,
    role,
  });

  const token = await generateJWT(user.id);

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

  const token = await generateJWT(user.id);

  const roleUser = user.role ?? 'This user has not role';

  return res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: roleUser,
    },
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { name, email, newPassword, currentPassword } = req.body;

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
    email: email.toLowerCase().trim(),
    password: encryptedPassword,
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
exports.getAllOrdersUser = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const orders = await Order.findAll({
    where: {
      userId: sessionUser.id,
      status: orderStatus.active,
    },
    include: [
      {
        model: Meal,
        attributes: {
          exclude: ['status', 'userId'],
        },
        include: [
          {
            model: Restaurant,
            attributes: ['id', 'name', 'address'],
          },
        ],
      },
    ],
  });
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
        include: {
          model: Restaurant,
          attributes: ['id', 'name', 'address'],
        },
      },
    ],
  });

  if (!order) {
    return next(new AppError(`Order with id: ${id} not found`, 400));
  }

  return res.status(200).json({
    status: 'success',
    message: 'Order retrieved successfully',
    order,
  });
});
