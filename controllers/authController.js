const { promisify } = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  // on signup password is shown in postman, however using this property postman will not display it
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  // console.log(url);

  await new Email(newUser, url).sendWelcome();

  // const token = signToken(newUser._id);
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  // object destucturing
  const { email, password } = req.body;

  // 1) check if email and passwords exist
  if (!email || !password) {
    // console.log('email or password is wrong');
    return next(new AppError('Please provide a valid email and password', 400));
  }

  // 2) check if user exists and password correct
  // mongoose o dm syntax
  const user = await User.findOne({ email }).select('+password');
  // console.log(`This is ${user}`);
  //
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3)If everything is ok and send Token back to client

  // console.log(`email is = ${email}`);
  // console.log(`password is = ${password}`);
  createSendToken(user, 200, res);
  // const Token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token: Token,
  // });
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// PROTECT
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it exists

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    token = req.cookies.jwt;
  }
  // console.log(`token is ${token}`);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please Log in to get access.', '401')
    );
  }
  // 2) verification of Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token dose not exists'),
      401
    );
  }
  // console.log(`THIS is decoded = ${decoded.iat}`);
  // 4) check if user changed passwordafter the Token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User Recently changed Password', 401));
  }
  // GRANT acess to protected Route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages , no errors
exports.isLogedin = async (req, res, next) => {
  if (req.cookies.jwt) {
    //
    try {
      // 1) verify Token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) check if user changed passwordafter the Token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //  there is a logged in user
      req.user = currentUser;
      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};

// RESTRICTTO
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin' , 'lead-guide'].  role ='user'
    // console.log(`this is answer = ${roles.includes(req.user.role)}`);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
//

//

// FORGOTPASSWORD
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get  user based on POSTED email

  const user = await User.findOne({ email: req.body.email });

  // console.log(`This is user = ${user}`);

  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) send it to user's Email
  //

  //
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  // const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIF you didn't forget your password , please ignore this email!`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message,
    // });

    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token Sent to Email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending email, Try again later ', 500)
    );
  }
});

// RESET PASSWORD
exports.resetPassword = catchAsync(async (req, res, next) => {
  // !) Get user based  on the Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired , and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3)Update changedPasswordAt Property for the user
  // 4) log te user in , send JWT

  createSendToken(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  // console.log(`this is 1st req.user = ${req.user}`);
  // console.log(`this is  req.user.id = ${req.user.id}`);

  const user = await User.findById(req.user.id).select('+password');
  // console.log(`this is user = ${user}`);

  //
  //2) check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('your current password is wrong', 401));
  }
  // 3)
  user.password = req.body.password;
  user.passwordConfirm = req.body.PasswordConfirm;
  await user.save();

  // 4)
  createSendToken(user, 200, res);
});
