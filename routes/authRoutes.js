const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const { validateSignup } = require('../util/validator');

router.get('/signup', authController.GetSignup);
router.post('/signup', validateSignup, authController.PostSignup);

router.get('/login', authController.GetLogin);
router.post('/login', authController.PostLogin);
router.post('/logout', authController.PostLogout);
router.get('/reset-password', authController.GetResetPassword);
router.post('/reset-password', authController.PostResetPassword);
router.get('/reset-password/:token', authController.GetNewPassword);
router.post('/new-password', authController.PostNewPassword);

module.exports = router;