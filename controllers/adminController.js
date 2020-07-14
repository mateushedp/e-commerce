const Product = require('../models/Product');
const User = require('../models/User');

exports.GetAddProduct = (req, res) => {
    res.render('add-product', {
        path: '/add-product',
        pageTitle: "Adicionar Produto"
    });
}

exports.PostAddProduct = (req, res) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    
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
        .catch(error => {
            console.log(error);
        });
    })
}

exports.GetEditProduct = (req, res) => {
    const id = req.params.id;
    Product.findByPk(id)
    .then(product => {
        res.render('edit-product', {
            prod: product,
            path: '/edit-product',
            pageTitle: "Editar Produto"
        });
    })
    .catch(error => {
        console.log(error);
    })
    
}

exports.PostEditProduct = (req, res) => {
    const id = req.body.id;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    Product.update({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl
    },
    {
        where: {id: id}
    })
    .then(() => {
        console.log("Product updated.");
        res.redirect('/');
    })
    .catch(error => {
        console.log(error);
    });

}

exports.DeleteProduct = (req, res) => {
    const id = req.body.id;

    Product.destroy(
        {
            where: {id: id}
        })
        .then(() => {
            console.log('Product deleted.');
            res.redirect('/');
        })
        .catch(error => {
            console.log(error);
        })
}