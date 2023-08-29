const { body, validationResult } = require('express-validator');
const { User } = require('../models/user.model');

const validFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.mapped(),
    });
  }

  next();
};

exports.createUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a correct format')
    .custom(async (value) => {
      const email = await User.findOne({
        where: {
          email: value.toLowerCase().trim(),
        },
      });
      if (email) {
        throw new Error(`Email ${value} already exists`);
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have contain a least one letter'),
  validFields,
];

exports.loginUserValidation = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validFields,
];

exports.updateUserValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  // body('email')
  //   .notEmpty()
  //   .withMessage('Email is required')
  //   .isEmail()
  //   .withMessage('Email must be a correct format')
  //   .custom(async (value) => {
  //     const email = await User.findOne({
  //       where: {
  //         email: value.toLowerCase().trim(),
  //       },
  //     });
  //     if (email) {
  //       throw new Error(`Email ${value} already exists`);
  //     }
  //   }),
  body('newPassword')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must have a least 8 characters')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must have contain a least one letter'),
  body('currentPassword').notEmpty().withMessage('Password is required'),
  validFields,
];

exports.createRestaurant = [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  validFields,
];

exports.updateRestaurant = [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  validFields,
];

exports.createReview = [
  body('comment').notEmpty().withMessage('Comment is required'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt()
    .withMessage('The rating must be a integer number')
    .custom((value) => {
      if (!(value <= 5 && value >= 0)) {
        throw new Error(`The rating must be between 0 and 5`);
      }
      return true;
    }),
  validFields,
];

exports.updateReview = [
  body('comment').notEmpty().withMessage('Comment is required'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt()
    .withMessage('The rating must be a integer number')
    .custom((value) => {
      if (!(value <= 5 && value >= 0)) {
        throw new Error(`The rating must be between 0 and 5`);
      }
      return true;
    }),
  validFields,
];

exports.createOrder = [
  body('mealId')
    .notEmpty()
    .withMessage('MealId is required')
    .isInt()
    .withMessage('The quantity must be a integer'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt()
    .withMessage('The quantity must be a integer')
    .custom((value) => {
      if (value <= 0) {
        throw new Error(`Quantity must be greater than 0`);
      }
      return true;
    }),
  validFields,
];

exports.createMeal = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt()
    .withMessage('The price must be a integer'),
  validFields,
];

exports.updateMeal = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt()
    .withMessage('The price must be a integer'),
  validFields,
];
