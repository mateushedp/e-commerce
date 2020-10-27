const express = require('express');
const router = express.Router();

const adminController = require('./../controllers/adminController');
const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');
const {check} = require('express-validator/check');
const { validateAddProduct, validateEditProduct } = require('../util/validator');


router.get('/add-product', isAuth, isAdmin, adminController.GetAddProduct);
router.post('/add-product', validateAddProduct, isAuth, isAdmin, adminController.PostAddProduct);
router.get('/edit-product/:id', isAuth, isAdmin, adminController.GetEditProduct);
router.post('/edit-product', validateEditProduct,  isAuth, isAdmin, adminController.PostEditProduct);
router.delete('/product/:id', isAuth, isAdmin, adminController.DeleteProduct);

module.exports = router;

