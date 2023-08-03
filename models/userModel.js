const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    require: [true, 'You must have a name'],
  },
  email: {
    type: String,
    require: [true, 'please provide email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    // Node.js, an enum (short for enumeration) is a feature of the schema definition that allows you to define a field with a restricted set of predefined values. It ensures that the field can only accept one of the specified values.
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'You must have a password'],
    // In Mongoose, you can define the properties to be selected using the select option in the schema definition. The select option allows you to specify which properties you want to include or exclude when querying documents. below is an eample
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'please provide a password'],
    minlength: 8,
    validate: {
      // This only works after SAVE!
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password are not same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    // In Mongoose, you can define the properties to be selected using the select option in the schema definition. The select option allows you to specify which properties you want to include or exclude when querying documents. below is an eample
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // only run this functiion if password was acutally modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//  Instance method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // const bool = bcrypt.compare(candidatePassword, userPassword);

  return await bcrypt.compare(candidatePassword, userPassword);
};
//

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt);

    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // False MEANS not Changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
// this is a mongoose schema
