const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UserController = require("../controllers/user");

router.get('/details',checkAuth, UserController.user_get_details);

router.post('/signup',UserController.user_signup);

router.post('/login',UserController.user_login);

router.patch('/:userId', checkAuth, UserController.user_update);

router.delete('/:userId', checkAuth, UserController.user_delete);

module.exports = router;