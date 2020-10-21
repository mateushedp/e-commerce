const express = require('express');
const router = express.Router();

const userController = require('./../controllers/userController');
const isAuth = require('../middleware/isAuth');

router.get('/', userController.ShowsHomePage);
router.get('/details/:id', userController.ShowsProductDetails);
router.get('/cart', isAuth, userController.GetCart);
router.post('/cart', isAuth, userController.PostCart);
router.post('/cart-delete-product', isAuth, userController.PostCartDeleteProduct);
router.get('/checkout', isAuth, userController.GetCheckout);
router.get('/checkout/success', isAuth, userController.GetCheckoutSuccess);
router.get('/checkout/cancel', isAuth, userController.GetCheckout);

router.get('/orders', isAuth, userController.GetOrders);
router.post('/create-order', isAuth, userController.PostOrder);
router.get('/orders/:orderId', isAuth, userController.GetInvoice);





module.exports = router;