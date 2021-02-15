const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.model')

passport.serializeUser((user, next) => {
  next(null, user.id);
});

passport.deserializeUser((id, next) => {
  User.findById(id)
    .then(user => next(null, user))
    .catch(next);
});

passport.use('local-auth', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, next) => {
  console.log('use passport')
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        next(null, false, { error: "El correo electrónico o la contraseña no son correctos" })
      } else {
        return user.checkPassword(password)
          .then(match => {
            if (match) {
              if (user.active) {
                next(null, user)
              } else {
                next(null, false, { error: "Tu cuenta no está activa, mira tu email" })
              }
            } else {
              next(null, false, { error: "El correo electrónico o la contraseña no son correctos" })
            }
          })
      }
    })
    .catch(next)
}))