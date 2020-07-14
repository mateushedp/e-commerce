const express = require('express');
const router = express.Router();

const adminController = require('./../controllers/adminController');
const isAuth = require('../middleware/isAuth');

router.get('/add-product', isAuth, adminController.GetAddProduct);
router.post('/add-product', isAuth, adminController.PostAddProduct);
router.get('/edit-product/:id', isAuth, adminController.GetEditProduct);
router.post('/edit-product', isAuth, adminController.PostEditProduct);
router.post('/delete-product', isAuth, adminController.DeleteProduct);

module.exports = router;

