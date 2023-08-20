const express = require('express');
const router = express.Router();

//Controllers
const mealController = require('../controllers/meal.controller');
//Middlewares
const mealMiddleware = require('../middlewares/meal.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const restaurantMiddleware = require('../middlewares/restaurant.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');
//Routes
router.get('/', mealController.findAllMeals);
router.get('/:id', mealMiddleware.validMeal, mealController.findOneMeal);

router.use(authMiddleware.protect, authMiddleware.allowTo('admin'));

router.post(
  '/:id',
  validationMiddleware.createMeal,
  restaurantMiddleware.validRestaurant,
  mealController.createMeal
);

router
  .use('/:id', mealMiddleware.validMeal)
  .route('/:id')
  .patch(validationMiddleware.updateMeal, mealController.updateMeal)
  .delete(mealController.deleteMeal);

module.exports = router;
