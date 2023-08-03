const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkId);

// POST/tour/12e44/reviews

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

//  mounting on router
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTour);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//  /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  // we removed authentication from get allTour since weant others websites to use our api for e.g collabration
  .get(tourController.getAllTour)
  // only admin & lead guide are allow to create Tours
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
// .post(tourController.chechBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)

  // only admin & lead guide are allow to patch tours
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
