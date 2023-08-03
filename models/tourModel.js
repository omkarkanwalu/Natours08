const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      requried: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must be less than or equal to 40 charcacters',
      ],
      minlength: [10, 'A tour name must be at least of 10 charcacters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      requried: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      default: 4.5,
    },
    difficulty: {
      type: String,
      requried: [true, 'A tour must have a difficulty'],
      // default: 0,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy ,medium  or difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'ratings must be above 1.0'],
      max: [5, 'ratings must be below to 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      requried: [true, 'A tour must have a Ratings Quantity'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    price: {
      type: Number,
      requried: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        // this only points to current doc on new document creation
        message: 'Discount price ({VALUE}) must be below regular price ',
      },
    },

    summary: {
      type: String,
      trim: true,
      requried: [true, 'A tour must have a summery'],
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      requried: [true, 'A tour must have a imageCover'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GEOjson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT middleware : runs befor.save() and .create
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  // console.log(this);
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY middleware

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});
// query middleware
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   this.find({ secretTour: { $ne: true } });
//   console.log(`Query took ${Date.now() - this.start} miliseconds!`);
//   console.log(docs);
//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
