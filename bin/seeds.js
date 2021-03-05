const faker = require("faker");
require("../config/db.config");
const Product = require("../models/Product.model");
const User = require("../models/User.model");

Promise.all([Product.deleteMany(), User.deleteMany()]).then(() => {
  // Create N users
  for (let i = 0; i < 100; i++) {
    User.create({
      email: faker.internet.email(),
      password: "Abcde1234",
      active: "true"
    }).then((u) => {
      // For each user, create N products
      for (let j = 0; j < 3; j++) {
        Product.create({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(),
          seller: u._id,
          image: faker.image.image(),
          location: {
            type: 'Point',
            coordinates: [faker.address.longitude(), faker.address.latitude()]
          }
        }).then((p) => console.log(`Created ${p.name} by ${u.email}`));
      }
    });
  }
});
