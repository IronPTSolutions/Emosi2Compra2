const mongoose = require("mongoose");
const User = require("../models/User.model");
const { sendActivationEmail } = require("../config/mailer.config");

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
  function renderWithErrors(e) {
    res.render("users/login", {
      user: req.body,
      error: e || "El correo electrónico o la contraseña no son correctos",
    });
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        renderWithErrors();
      } else {
        user.checkPassword(req.body.password).then((match) => {
          if (match) {
            if (user.active) {
              req.session.currentUserId = user.id;

              res.redirect("/profile");
            } else {
              renderWithErrors("Tu cuenta no está activa, mira tu email");
            }
          } else {
            renderWithErrors();
          }
        });
      }
    })
    .catch((e) => next(e));
};

module.exports.logout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
};

module.exports.profile = (req, res, next) => {
  res.render("users/profile");
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
          message: "Felicidades, has activado tu cuenta. Ya puedes iniciar sesión",
        });
      } else {
        res.redirect("/")
      }
    })
    .catch((e) => next(e));
};
