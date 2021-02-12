const router = require("express").Router();
const miscController = require("../controllers/misc.controller");
const usersController = require("../controllers/users.controller");
const productsController = require("../controllers/products.controller");
const secure = require("../middlewares/secure.middleware");

// Misc

router.get("/", miscController.home);

// Users

router.get("/register", secure.isNotAuthenticated, usersController.register);
router.post("/register", secure.isNotAuthenticated, usersController.doRegister);
router.get("/login", secure.isNotAuthenticated, usersController.login);
router.post("/login", secure.isNotAuthenticated, usersController.doLogin);
router.get("/activate/:token", secure.isNotAuthenticated, usersController.activate);
router.post("/logout", secure.isAuthenticated, usersController.logout);
router.get("/profile", secure.isAuthenticated, usersController.profile);
router.get("/wishlist", secure.isAuthenticated, usersController.wishlist);

// Products
router.get("/products/create", productsController.create);
router.post("/products/create", productsController.doCreate);
router.get("/products/:id", productsController.detail);
router.get("/products/:id/edit", productsController.edit);
router.post("/products/:id/edit", productsController.doEdit);
router.get("/products/:id/delete", productsController.delete);

// Likes
router.get("/product/:productId/like", secure.isAuthenticated, miscController.like);

module.exports = router;
