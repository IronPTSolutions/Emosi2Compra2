const Product = require("../models/Product.model");
const mongoose = require("mongoose");
const flash = require('connect-flash');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const createError = require("http-errors");

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
      const isOwner = req.currentUser
      ? product.seller.toString() === req.currentUser.id.toString()
      : false;

      res.render("products/detail", {
        product,
        canBuy: product.available && !isOwner,
        canEdit: isOwner,
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

module.exports.buy = (req, res, next) => {
  Product.findById(req.params.id)
    .then(product => {
      if (!product) {
        next(createError(404));
      } else if(!product.available) {
        next(createError(403))
      } else {
        return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [{
            amount: product.price * 100,
            currency: 'EUR',
            name: product.name,
            quantity: 1
          }],
          customer_email: req.currentUser.email,
          success_url: `http://localhost:3000?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `http://localhost:3000/products/${product.id}`,
          metadata: {
            product: product.id
          }
        })
          .then(session => {
            res.json({
              sessionId: session.id,
            });
          })
      }
    })
    .catch(next)
}

module.exports.webhook = (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_SIGNING_SECRET);
  } catch (err) {
    console.error(err)
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fulfill the purchase...
    Product.findByIdAndUpdate(session.metadata.product, { available: false }, { new: true })
    .then(() => {
        console.log(`Product with id ${session.metadata.product} has been bought`)
        res.status(200)
      })
    .catch(next)
  } else {
    res.status(200)
  }
}
