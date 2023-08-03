const APIFeatures = require('./../utils/apiFeatures');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image , please upload image', 404), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) coverImage
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkId =
//   ('id',
//   (req, res, next, val) => {
//
//     if (req.param.id * 1 > tours.length) {
//       return res.status(404).json({ status: 'fail', message: 'Invalid' });
//     }
//     next();
//   });

// exports.chechBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res
//       .status(404)
//       .json({ status: 'Fail', message: 'requrie name or price' });
//   }
//   next();
// };

// 1) GetAllTours

exports.getAllTour = factory.getAll(Tour);
// exports.getAllTour = catchAsync(async (req, res, next) => {
//   // try {
//   // Build QUERY
//   // 1A) FILTERING
//   // const queryObj = { ...req.query };

//   // const excludedFields = ['page', 'sort', 'limit', 'fields'];

//   // excludedFields.forEach((el) => delete queryObj[el]);

//   // // 1B) ADVANCE FILTERING
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//   // let query = Tour.find(JSON.parse(queryStr));

//   // 2) Sorting
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');

//   //   query = query.sort(sortBy);
//   // } else {
//   //   query = query.sort('_id');
//   // }

//   // LIMITING
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   // pagination
//   // const page = req.query.page * 1 || 1;

//   // const limit = req.query.limit * 1 || 100;

//   // const skip = (page - 1) * limit;

//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) throw new Error('This page does not exist');
//   // }

//   //EXECUTE query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();

//   const tours = await features.query;
//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'Success',
//     result: tours.length,
//     data: {
//       tour: tours,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'Fail',
//   //     message: err,
//   //   });
//   // }
// });

// 2) getTour
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//
//   // try {
//
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//
//   if (!tour) {
//     return next(new AppError('No Tour Found With That ID', 404));
//   }
//   res.status(200).json({
//     status: 'Success',

//     data: {
//       tour: tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'Fail',
//   //     message: err,
//   //   });
//   // }
// });

// 3)createTour

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
// try {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// } catch (err) {
//   res.status(400).json({
//     status: 'Fail',
//     message: err,
//   });
// }

// 4)updateTour
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No Tour Found With That ID', 404));
//   }
//   res.status(200).json({
//     status: 'Success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'Fail',
//   //     message: err,
//   //   });
//   // }
// });

// 5)Delete

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No Tour Found With That ID', 404));
//   }

//   res.status(204).json({
//     status: 'Success',
//     data: null,
//   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'Fail',
//   //     message: err,
//   //   });
//   // }
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numsRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: `$ratingsAverage` },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'Success',
    result: plan.length,
    data: {
      plan,
    },
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

//  '/tours-within/:distance/center/:latlng/unit/:unit'
//   /tours-distance/233/center/-40,45/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'please Provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'Success',
    result: tours.length,
    data: { data: tours },
  });
});

// '/distances/:latlng/unit/:unit'
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'please Provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  //
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',

    data: distances,
  });
});
