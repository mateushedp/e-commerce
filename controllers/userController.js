const Product = require('../models/Product');
const User = require('../models/User');
const errorHandler = require('../util/errorHelper');


exports.ShowsHomePage = (req, res, next)=> {
    Product.findAll()
    .then(products => {
        res.render('home', {
            prods: products,
            path: '/',
            pageTitle: "Home"
        });
    })
    .catch(errorHandler(next));
};

exports.ShowsProductDetails = (req, res, next) => {
    let id = req.params.id;
    Product.findByPk(id)
    .then(product => {
        res.render('details', {
            prod: product,
            path: '/details',
            pageTitle: product.title
        })
    })
    .catch(errorHandler(next));
};

exports.GetCart = (req, res, next) => {
    User.findByPk(req.session.user.id)
    .then(user => {
        user.getCart()
        .then(cart => {
            return cart.getProducts()
            .then(products => {
                res.render('cart', {
                    prods: products,
                    path: '/cart',
                    pageTitle: "Carrinho"
                })
            })
            .catch(errorHandler(next));
        })
        .catch(errorHandler(next));
    })
}

exports.PostCart = (req, res, next) => {
    const prodId = req.body.id;
    let fetchedCart;
    let newQuantity = 1;

    User.findByPk(req.session.user.id)
    .then(user => {
        user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({where: {id: prodId}});
    })
    .then(products => {
        let product;
        if(products.length>0){
            product = products[0];
        }
        
        if(product){
            //se já existe esse produto no carrinho, aumentar a quantidade
            const oldQuantity = product.cartItem.quantity;
            newQuantity = oldQuantity + 1;
            return product;
        }
        return Product.findByPk(prodId)
        
    })
    .then(product => {
        return fetchedCart.addProduct(product, {
            through: {quantity: newQuantity}
        });
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(errorHandler(next));
    })
}

exports.PostCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.id;
    User.findByPk(req.session.user.id)
    .then(user => {
        user.getCart()
    .then(cart => {
        return cart.getProducts({
            where:{id:prodId}
        })
    })
    .then(products => {
        const product = products[0];
        return product.cartItem.destroy();
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(errorHandler(next));
    })
}

exports.PostOrder = (req, res, next) => {
    let fetchedCart;
    let thisUser
    User.findByPk(req.session.user.id)
    .then(user => {
        thisUser = user;
        user.getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return thisUser.createOrder()
            .then(order => {
                order.addProducts(products.map(product => {
                    product.orderItem = {quantity: product.cartItem.quantity};
                    return product;
                }))
            })
        })
        .then(result => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            req.session.save(() =>{
                res.redirect('/orders');
            })
        })
        .catch(errorHandler(next));
    })
}

exports.GetOrders = (req, res, next) => {
    User.findByPk(req.session.user.id)
    .then(user => {
        user.getOrders({include: ['products']})
    .then(orders => {
        res.render('orders', {
            orders: orders,
            path: '/orders',
            pageTitle: "Seu Pedido"
        })

    })
    .catch(errorHandler(next));
    })
}
