const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const Image = require('../models/Image');
const errorHandler = require('../util/errorHelper');

exports.GetAddProduct = (req, res, next) => {
    res.render('add-product', {
        path: '/add-product',
        pageTitle: "Adicionar Produto",
        errorMessage: null,
        oldInput: {
            title: '',
            price: '',
            description: ''
        },
        validationErrors: [],
    });
}

exports.PostAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const images = req.files;
    const errors = validationResult(req);

    if(!images){
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
    
    
    User.findByPk(req.session.user.id)
    .then(user => {
        user.createProduct({
            title: title,
            price: price,
            description: description,
        })
        .then(prod => {
            for(img of images){
                prod.createImage({
                    path: img.path
                })
            }
        })
        .then(result => {
            console.log('Product created.');
            req.session.save(() =>{
                return res.redirect('/');
            })
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
                description: ''
            },
            validationErrors: []
        });
    })
    .catch(errorHandler(next));
    
}

exports.PostEditProduct = async (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const images = req.files;
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
    
    const product = await Product.findByPk(id);
    product.update({
        title: title,
        price: price,
        description: description
    });

    if(images.length>0){
        await Image.destroy({where:{productId:id}});
        for(img of images){
            await product.createImage({
                path: img.path
            })
        }
    }
    res.redirect('/');

}

exports.DeleteProduct = (req, res, next) => {
    const id = req.params.id;

    Product.destroy(
        {
            where: {id: id}
        })
        .then(() => {
            console.log('Product deleted.');
            res.status(200).json({
                message: 'Product deleted.'
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Deleting product failed.'
            })
        });
}
