const router = require("express").Router();
const miscController = require('../controllers/misc.controller')
const usersController = require('../controllers/users.controller')

// Misc

router.get('/', miscController.home)

// Users

router.get('/register', usersController.register)
router.post('/register', usersController.doRegister)

module.exports = router;
