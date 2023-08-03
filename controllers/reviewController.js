const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const Booking = require('./../models/bookingModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = factory.getAll(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   // console.log(' reached till getAllReviews');
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'Success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.setToursUserIds = (req, res, next) => {
  // Allow nested routes
  // console.log(`this is req.param = ${req.params.tourId}`);
  if (!req.body.tour) req.body.tour = req.params.tourId;

  // whenever we want loged in user id  then write req.user.id
  if (!req.body.user) req.body.user = req.user.id;
  //
  next();
};
exports.createReview = factory.createOne(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//   //
//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.checkBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.find({
    user: req.user.id,
    tour: req.body.tour,
  });
  // console.log(`This is booking = ${booking}`);
  if (booking.length === 0) {
    return next(new AppError('You must buy tour to review it', 401));
  }
  next();
});
