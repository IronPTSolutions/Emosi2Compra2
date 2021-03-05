const mongoose = require("mongoose");
const Like = require("./Like.model");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    seller: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

productSchema.index({ location: '2dsphere' });

productSchema.virtual("likes", {
  ref: "Like",
  localField: "_id",
  foreignField: "product",
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
