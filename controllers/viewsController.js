const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const Review = require('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template

  // 3) Render that template using tour data from 1)

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) GET THE DATA for the requested tour (including reviews and guides)
  //
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour for this name', 404));
  }
  // 2) Build Template

  // 3) render template using data from 1)

  res
    .status(200)
    // .set(
    //   'Content-Security-Policy',
    //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    // )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'log into your account',
    });
};

exports.getSignUpForm = (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('signup', {
      title: 'create your account',
    });
};

exports.myReviews = (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('abc', {
      title: 'My Reviews',
    });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('mytours', {
    title: 'MY Tours',
    tours,
  });
});

exports.getMyReviewsfrom = catchAsync(async (req, res, next) => {
  // 1) Get reviews of the currently logged in user

  const reviews = await Review.find({ user: res.locals.user.id }).populate({
    path: 'tour',
    select: 'name slug',
  });

  res.status(200).render('myreviews', {
    title: 'My reviews',
    reviews,
    toursNames: true,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log(req.body.id);
  const updatedUser = await User.findByIdAndUpdate(
    req.body.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});
