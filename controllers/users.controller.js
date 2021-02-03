const mongoose = require("mongoose")
const User = require("../models/user.model")

module.exports.register = (req, res, next) => {
  res.render('users/register')
}

module.exports.doRegister = (req, res, next) => {
  function renderWithErrors(errors) {
    res.status(400).render('users/register', {
      errors: errors
    })
  }

  User.create(req.body)
    .then(() => res.redirect('/'))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        renderWithErrors(e.errors)
      } else if (e.code === 11000) {
        renderWithErrors({ email: 'Ya existe una cuenta con ese email' })
      } else {
        next(e)
      }
    })
}