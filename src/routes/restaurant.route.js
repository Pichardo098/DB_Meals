const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');

//Controllers
const restaurantController = require('../controllers/restaurant.controller');
//Middlewares
const authMiddleware = require('../middlewares/auth.middleware');
const restaurantMiddleware = require('../middlewares/restaurant.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');

//Routes
router.get('/', restaurantController.findAllRestaurants);
router.get(
  '/:id',
  restaurantMiddleware.validRestaurant,
  restaurantController.findOneRestaurant
);

router.use(authMiddleware.protect);

router.post(
  '/reviews/:id',
  validationMiddleware.createReview,
  restaurantMiddleware.validRestaurant,
  restaurantController.createReview
);

router
  .use(
    '/reviews/:restaurantId/:id',
    restaurantMiddleware.validRestaurantAndReview
  )
  .route('/reviews/:restaurantId/:id')
  .patch(
    validationMiddleware.updateReview,
    authMiddleware.protectAccountOwner,
    restaurantController.updateReview
  )
  .delete(
    authMiddleware.protectAccountOwner,
    restaurantController.deleteReview
  );

router.use(authMiddleware.allowTo('admin'));

router.post(
  '/',
  upload.single('restaurantImg'),
  validationMiddleware.createRestaurant,
  restaurantController.createRestaurant
);

router
  .route('/:id')
  .patch(
    upload.single('restaurantImg'),
    restaurantMiddleware.validRestaurant,
    validationMiddleware.updateRestaurant,
    restaurantController.updateRestaurant
  )
  .delete(
    restaurantMiddleware.validRestaurant,
    restaurantController.deleteRestaurant
  );

module.exports = router;
