const { User, userStatus } = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.validUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    where: {
      id,
      status: userStatus.active,
    },
  });

  if (!user) {
    return next(new AppError(`User with id: ${id} not found`, 400));
  }

  req.user = user;
  next();
});
