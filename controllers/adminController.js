const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const errorHandler = require('../util/errorHelper');

exports.GetAddProduct = (req, res, next) => {
    res.render('add-product', {
        path: '/add-product',
        pageTitle: "Adicionar Produto",
        errorMessage: null,
        oldInput: {
            title: '',
            price: '',
            description: '',
            imageUrl: ''
        },
        validationErrors: [],
    });
}

exports.PostAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;
    const errors = validationResult(req);

    if(!image){
        return res.status(422).render('add-product', {
            path: '/add-product',
            pageTitle: "Adicionar Produto",
            errorMessage: "Arquivo anexado não é uma imagem",
            oldInput: {
                title: title,
                price: price,
                description: description,
            },
            validationErrors: []
        })
    }

    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('add-product', {
            path: '/add-product',
            pageTitle: "Adicionar Produto",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                title: title,
                price: price,
                description: description,
            },
            validationErrors: errors.array()
        })
    }
    const imageUrl = image.path;
    
    User.findByPk(req.session.user.id)
    .then(user => {
        user.createProduct({
            title: title,
            price: price,
            description: description,
            imageUrl: imageUrl,
        })
        .then(result => {
            console.log("Product created.");
            console.log(result);
            res.redirect('/');
        })
        .catch(errorHandler(next));
    })

}

exports.GetEditProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findByPk(id)
    .then(product => {
        res.render('edit-product', {
            prod: product,
            path: '/edit-product',
            pageTitle: "Editar Produto",
            errorMessage: null,
            oldInput: {
                title: '',
                price: '',
                description: '',
                imageUrl: ''
            },
            validationErrors: []
        });
    })
    .catch(errorHandler(next));
    
}

exports.PostEditProduct = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;
    const errors = validationResult(req);


    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('edit-product', {
            path: '/edit-product',
            pageTitle: "Editar Produto",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                title: title,
                price: price,
                description: description,
            },
            validationErrors: errors.array()
        })
    }

    if(image){
        Product.update({imageUrl: image.path}, {where: {id:id}});
    }

    Product.update({
        title: title,
        price: price,
        description: description
        
    },
    {
        where: {id: id}
    })
    .then(() => {
        console.log("Product updated.");
        res.redirect('/');
    })
    .catch(errorHandler(next));

}

exports.DeleteProduct = (req, res, next) => {
    const id = req.body.id;

    Product.destroy(
        {
            where: {id: id}
        })
        .then(() => {
            console.log('Product deleted.');
            res.redirect('/');
        })
        .catch(errorHandler(next));
}
