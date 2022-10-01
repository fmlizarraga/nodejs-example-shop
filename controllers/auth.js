const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid');
const {validationResult} = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgrid({
    apiKey: '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'
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const mail = req.body.email;
  const pass = req.body.password;
  const errors = validationResult(req);
  // console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: mail, password: pass},
      validationErrors: [{param: 'email'},{param: 'password'}]
    });
  }

  User.findOne({email: mail})
  .then(myUser => {
    bcrypt
    .compare(pass, myUser.password)
    .then(doMatch => {
      if (doMatch) {
        req.session.user = myUser;
        req.session.isLoggedIn = true;
        return req.session.save(err => {
          console.log(err);
          res.redirect('/');
        });
      }
      res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Email o clave incorrectos',
        oldInput: {email: mail, password: pass},
        validationErrors: [{param: 'email'},{param: 'password'}]
      });
    }).catch(err => {
      console.log(err);
      res.redirect('/login');
    });
  })
  .catch(err => {
    const error = new Error('Error al intentar registrar el nuevo producto');
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password, confirmPassword: req.body.confirmPassword},
      validationErrors: errors.array()
    });
  }
    bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'franco.error404@gmail.com',
        subject: 'Registro exitoso!',
        html: '<h1>Gracias por registrarse en nuestro sitio!</h1>'
      });
    })
    .catch(err => {
      const error = new Error('Error al intentar registrar el nuevo producto');
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        req.flash('error', 'No account registered with that email!');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'franco.error404@gmail.com',
        subject: 'Pass Reset',
        html: `
        <p>Ha solicitado reestablecer la clave de su cuenta</p>
        <p>Click en este <a href:"http://localhost:3000/reset/${token}">link</a> para resstablecer la clave.</p>
        `
      });
    })
    .catch(err => {
      const error = new Error('Error al intentar registrar el nuevo producto');
      error.httpStatusCode = 500;
      return next(error);
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration:{$gt: Date.now()}})
  .then(user => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  })
  .catch(err => {
    const error = new Error('Error al intentar registrar el nuevo producto');
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken, 
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId
  })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetToken = undefined;
    resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => {
    const error = new Error('Error al intentar registrar el nuevo producto');
    error.httpStatusCode = 500;
    return next(error);
  });
};