const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLogedin,
  viewsController.getOverview
);

router.get('/tour/:slug', authController.isLogedin, viewsController.getTour);
router.get('/login', authController.isLogedin, viewsController.getLoginForm);
router.get('/signup', viewsController.getSignUpForm);
router.get(
  '/my-reviews',
  authController.isLogedin,
  viewsController.getMyReviewsfrom
);

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post('/submit-user-data', viewsController.updateUserData);

module.exports = router;
