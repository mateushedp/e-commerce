const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const isAuth = require('../middleware/isAuth');

router.get('/signup', authController.GetSignup);
router.post('/signup', authController.PostSignup);
router.get('/login', authController.GetLogin);
router.post('/login', authController.PostLogin);
router.post('/logout', authController.PostLogout);
router.get('/reset-password', authController.GetResetPassword);

module.exports = router;