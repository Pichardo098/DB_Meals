const express = require('express');
const router = express.Router();

//Controllers
const orderController = require('../controllers/order.controller');
//Middlewares
const authMiddleware = require('../middlewares/auth.middleware');
const orderMiddleware = require('../middlewares/order.middleware');
const validationMiddleware = require('../middlewares/validations.middleware');
//Routes
router.use(authMiddleware.protect);

router.post('/', validationMiddleware.createOrder, orderController.createOrder);
router.get('/me', orderController.findMyOrders);

router
  .use('/:id', orderMiddleware.validOrder)
  .route('/:id')
  .patch(authMiddleware.protectAccountOwner, orderController.updateOrder)
  .delete(authMiddleware.protectAccountOwner, orderController.deleteOrder);

module.exports = router;
