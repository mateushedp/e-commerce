const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_API)
const PDFDocument = require('pdfkit');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const errorHandler = require('../util/errorHelper');
const Cart = require('../models/Cart');

const ITEMS_PER_PAGE = 20;


exports.ShowsHomePage = (req, res, next)=> {
    const page = +req.query.page || 1;
    let totalItems;

    Product.count()
    .then(numProducts => {
        totalItems = numProducts;
        return Product.findAll({
            include: ['images'], 
            offset: (page-1) * ITEMS_PER_PAGE, 
            limit: ITEMS_PER_PAGE})
    })
    .then(products => {
        res.render('home', {
            prods: products,
            path: '/',
            pageTitle: "Home",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page+1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    })
    .catch(errorHandler(next));
};

exports.ShowsProductDetails = (req, res, next) => {
    let id = req.params.id;
    Product.findByPk(id, {include: ['images']})
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
            return cart.getProducts({include: ['images']})
            .then(products => {
                let total = 0;
                for(product of products){
                    total += product.price * product.cartItem.quantity;
                }
                res.render('cart', {
                    prods: products,
                    path: '/cart',
                    pageTitle: "Carrinho",
                    totalSum: total
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

exports.GetCheckout = (req, res, next) => {
    let products;
    let total = 0;

    User.findByPk(req.session.user.id)
    .then(user => {
        user.getCart()
        .then(cart => {
            return cart.getProducts({include: ['images']})
            .then(prods => {
                products = prods;
                total = 0;
                for(product of products){
                    total += product.price * product.cartItem.quantity;
                }
                
                return stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: products.map(product => {
                        return {
                            name: product.title,
                            description: product.description,
                            amount: product.price * 100,
                            currency: 'brl',
                            quantity: product.cartItem.quantity
                        }
                    }),
                    success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                    cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
                })
                
            })
            .then(session => {
                res.render('checkout', {
                    prods: products,
                    path: '/checkout',
                    pageTitle: "Finalizar Compra",
                    totalSum: total,
                    sessionId: session.id
                })
            })
            .catch(errorHandler(next));
        })
        .catch(errorHandler(next));
    })
}

exports.GetCheckoutSuccess = (req, res, next) => {
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
        .then(() => {
            return fetchedCart.setProducts(null);
        })
        .then(() => {
            req.session.save(() =>{
                res.redirect('/orders');
            })
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
        .then(() => {
            return fetchedCart.setProducts(null);
        })
        .then(() => {
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

exports.GetInvoice = (req, res, next) => {
    let totalPrice = 0;
    const orderId = req.params.orderId;
    Order.findByPk(orderId)
    .then(order => {
        if(!order){
            return next(new Error('Nenhuma ordem encontrada'));
        }
        if(order.userId !== req.session.user.id){
            return next(new Error('Não autorizado'));
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName +'"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text("Sua fatura");
        pdfDoc.text("---------------------------");
        order.getProducts()
        .then(products => {
            for(prod of products){
                totalPrice+= parseFloat(prod.price * prod.orderItem.quantity);
                pdfDoc.fontSize(14).text(prod.title + ' - ' + prod.orderItem.quantity + 'x' + ' R$' + prod.price);
            }
            pdfDoc.text(' ');
            pdfDoc.fontSize(20).text('Total: R$' + totalPrice);
            pdfDoc.end();
            

        })
        
        

    })
    .catch(errorHandler(next));
    
}
