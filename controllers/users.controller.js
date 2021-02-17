const mongoose = require("mongoose");
const passport = require('passport')
const User = require("../models/User.model");
const Like = require("../models/Like.model");
const { sendActivationEmail } = require("../config/mailer.config");
const Product = require("../models/Product.model");

module.exports.register = (req, res, next) => {
  res.render("users/register");
};

module.exports.doRegister = (req, res, next) => {
  function renderWithErrors(errors) {
    res.status(400).render("users/register", {
      errors: errors,
      user: req.body,
    });
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        renderWithErrors({
          email: "Ya existe un usuario con este email",
        });
      } else {
        User.create(req.body)
          .then((u) => {
            sendActivationEmail(u.email, u.activationToken);
            res.redirect("/");
          })
          .catch((e) => {
            if (e instanceof mongoose.Error.ValidationError) {
              renderWithErrors(e.errors);
            } else {
              next(e);
            }
          });
      }
    })
    .catch((e) => next(e));
};

module.exports.login = (req, res, next) => {
  res.render("users/login");
};

module.exports.doLogin = (req, res, next) => {
  passport.authenticate('local-auth', (error, user, validations) => {
    if (error) {
      next(error);
    } else if (!user) {
      res.status(400).render('users/login', { user: req.body, error: validations.error });
    } else {
      req.login(user, loginErr => {
        if (loginErr) next(loginErr)
        else res.redirect('/')
      })
    }
  })(req, res, next);
};

module.exports.doLoginGoogle = (req, res, next) => {
  passport.authenticate('google-auth', (error, user, validations) => {
    if (error) {
      next(error);
    } else if (!user) {
      res.status(400).render('users/login', { user: req.body, error: validations });
    } else {
      req.login(user, loginErr => {
        if (loginErr) next(loginErr)
        else res.redirect('/')
      })
    }
  })(req, res, next)
}

module.exports.logout = (req, res, next) => {
  req.logout();
  res.redirect("/");
};

module.exports.profile = (req, res, next) => {
  Product.find(req.currentUser ? { seller: req.currentUser._id } : {}).then(
    (products) => {
      res.render("users/profile", {
        products: products.map((p) => {
          p.disabled = true;
          return p;
        }),
      });
    }
  );
};

module.exports.activate = (req, res, next) => {
  User.findOneAndUpdate(
    { activationToken: req.params.token, active: false },
    { active: true, activationToken: "active" }
  )
    .then((u) => {
      if (u) {
        res.render("users/login", {
          user: req.body,
          message:
            "Felicidades, has activado tu cuenta. Ya puedes iniciar sesión",
        });
      } else {
        res.redirect("/");
      }
    })
    .catch((e) => next(e));
};

module.exports.wishlist = (req, res, next) => {
  Like.find({ user: req.currentUser._id })
    .populate("product")
    .then((likes) => {
      res.render("users/wishlist", {
        products: likes.map((l) => {
          return { ...l.toJSON().product, likedByUser: true };
        }),
      });
    });
};

module.exports.list = (req, res, next) => {
  User.find()
    .then(users => res.render('users/list',  { users }))
    .catch(next)
}
