const Product = require("../models/Product.model");
const mongoose = require("mongoose");
const flash = require('connect-flash');

module.exports.create = (req, res, next) => {
  req.flash('flashMessage', 'Vas a crear un producto!')
  res.render("products/form");
};

module.exports.doCreate = (req, res, next) => {
  function renderWithErrors(errors) {
    res.status(400).render("products/form", {
      errors: errors,
      product: req.body,
    });
  }

  if (req.file) {
    req.body.image = req.file.path;
  }

  req.body.location = {
    type: 'Point',
    coordinates: [Number(req.body.lng), Number(req.body.lat)]
  }

  req.body.seller = req.currentUser.id

  Product.create(req.body)
    .then((u) => {
      req.flash('flashMessage', '¡Producto creado con éxito!')
      res.redirect(`/products/${u.id}`);
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        renderWithErrors(e.errors);
      } else {
        next(e);
      }
    });
};

module.exports.edit = (req, res, next) => {
  Product.findById(req.params.id)
    .then((product) => {
      if (
        !product ||
        product.seller.toString() !== req.currentUser.id.toString()
      ) {
        res.redirect("/");
      } else {
        res.render("products/form", {
          product, lat: product.location.coordinates[1], lng: product.location.coordinates[0]
        });
      }
    })
    .catch((e) => next(e));
};

module.exports.doEdit = (req, res, next) => {
  function renderWithErrors(errors) {
    res.status(400).render("products/form", {
      errors: errors,
      product: req.body,
      lat: req.body.lat,
      lng: req.body.lng
    });
  }

  if (req.file) {
    req.body.image = req.file.path;
  }

  req.body.location = {
    type: 'Point',
    coordinates: [req.body.lng, req.body.lat]
  }

  Product.findById(req.params.id)
    .then((p) => {
      if (!p || p.seller.toString() !== req.currentUser.id.toString()) {
        res.redirect("/");
      } else {
        Object.entries(req.body).forEach(([k, v]) => (p[k] = v));
        return p.save().then(() => {
          res.redirect(`/products/${req.params.id}`);
        });
      }
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        renderWithErrors(e.errors);
      } else {
        next(e);
      }
    });
};

module.exports.detail = (req, res, next) => {
  Product.findById(req.params.id)
    .then((product) => {
      res.render("products/detail", {
        product,
        canEdit: req.currentUser
          ? product.seller.toString() === req.currentUser.id.toString()
          : false,
        lat: product.location.coordinates[1],
        lng: product.location.coordinates[0]
      });
    })
    .catch((e) => next(e));
};

module.exports.delete = (req, res, next) => {
  Product.findOneAndDelete({ _id: req.params.id, seller: req.currentUser.id })
    .then(() => {
      res.redirect("/");
    })
    .catch((e) => next(e));
};
