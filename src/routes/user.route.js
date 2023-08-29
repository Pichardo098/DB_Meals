const express = require('express');
const router = express.Router();

//Controllers
const userController = require('../controllers/user.controller');
//Middlewares
const userMiddleware = require('../middlewares/user.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');
const upload = require('../utils/multer');

//Routes
router.post(
  '/signup',
  upload.single('userProfileImg'),
  validationMiddleware.createUserValidation,
  userController.signupUser
);
router.post(
  '/login',
  validationMiddleware.loginUserValidation,
  userController.loginUser
);

router.use(authMiddleware.protect);

router
  .route('/:id')
  .patch(
    upload.single('userProfileImg'),
    validationMiddleware.updateUserValidation,
    userMiddleware.validUser,
    authMiddleware.protectAccountOwner,
    userController.updateUser
  )
  .delete(
    userMiddleware.validUser,
    authMiddleware.protectAccountOwner,
    userController.deleteUser
  );

router.get('/orders', userController.getAllOrdersUser);
router.get('/orders/:id', userController.getDetailOneOrder);

module.exports = router;
