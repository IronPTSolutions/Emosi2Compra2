const Product = require("../models/Product.model");
const Like = require("../models/Like.model");

module.exports.home = (req, res, next) => {
  Product.find()
    .populate("likes")
    .then((products) => {
      res.render("home", {
        products: products.map((p, i) => {
          p = p.toJSON();
          p.likeCount = p.likes.length;
          p.disabled = req.currentUser
            ? p.seller.toString() === req.currentUser._id.toString()
            : true;
          p.likedByUser = req.currentUser
            ? p.likes.some(
                (l) => l.user.toString() == req.currentUser._id.toString()
              )
            : false;
          return p;
        }),
      });
    })
    .catch((e) => next(e));
};

module.exports.like = (req, res, next) => {
  Like.findOne({ product: req.params.productId, user: req.currentUser._id })
    .then((like) => {
      if (!like) {
        return Like.create({
          product: req.params.productId,
          user: req.currentUser._id,
        }).then(() => {
          // Dándole a like
          res.json({ add: 1 });
        });
      } else {
        return Like.findByIdAndDelete(like._id).then(() => {
          // Dándole a dislike
          res.json({ add: -1 });
        });
      }
    })
    .catch((e) => next(e));
};
