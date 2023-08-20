const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');

//Errorhandling
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');

//Routes
const restaurantRoutes = require('./routes/restaurant.route');
const mealRoutes = require('./routes/meal.route');
const orderRoutes = require('./routes/order.route');
const userRoutes = require('./routes/user.route');

//App.use
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Endpoints
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/meals', mealRoutes);
app.use('/api/v1/orders', orderRoutes);

//All errors
app.all('*', (req, res, next) => {
  return next(
    new AppError(`Cannot find ${req.originalUrl} on this server`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
