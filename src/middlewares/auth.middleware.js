const { promisify } = require('util');
const { User, userStatus } = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please login first!'));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.SECRET_JWT_SEED
  );

  const user = await User.findOne({
    where: {
      id: decoded.id,
      status: userStatus.active,
    },
  });

  if (!user) {
    return next(new AppError('This user account is not active', 400));
  }

  if (user.updatedAt) {
    const changeTimeStamp = parseInt(user.updatedAt.getTime() / 1000, 10);
    if (decoded.iat < changeTimeStamp) {
      return next(
        new AppError('User recently changed data! Please login again.', 401)
      );
    }
  }

  req.sessionUser = user;
  next();
});

exports.protectAccountOwner = (req, res, next) => {
  const { user, sessionUser } = req;

  if (user.id !== sessionUser.id) {
    return next(new AppError("You don't own this account", 401));
  }

  next();
};

exports.allowTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.sessionUser.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
