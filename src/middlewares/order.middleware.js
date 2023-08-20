const { Order, orderStatus } = require('../models/order.model');
const { User } = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.validOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findOne({
    where: {
      id,
      status: orderStatus.active,
    },
    include: [
      {
        model: User,
      },
    ],
  });

  if (!order) {
    return next(new AppError(`Order with id:${id}, it's not active`));
  }

  req.order = order;
  req.user = order.user;
  next();
});
