const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendGrid = require('nodemailer-sendgrid-transport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const {validationResult} = require('express-validator/check');
const errorHandler = require('../util/errorHelper');


var transporter = nodemailer.createTransport(sendGrid({
    auth: {
        api_key: process.env.SENDGRID_API
    }
}));



exports.GetSignup = (req, res, next) => {
    res.render('signup', {
        path: '/signup',
        pageTitle: "Cadastro",
        errorMessage: req.flash('error')[0],
        oldInput: {
            name: '',
            email: '',
            password: ''
        },
        validationErrors: []
    });
}

exports.PostSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('signup', {
            path: '/signup',
            pageTitle: "Cadastro",
            errorMessage: errors.array()[0].msg,
            oldInput: {name: name, email: email, password: password},
            validationErrors: errors.array()
        });
    }

  
    bcrypt.hash(password, 12)
    .then(hasedPassword => {
            User.create({
                name: name,
                email: email,
                password: hasedPassword
            })
    .then(user => {
        user.createCart()
            .then(result => {
                console.log("User created.");
                console.log("Name: " + user.name);
                res.redirect('/login');

                return transporter.sendMail({
                    to: email,
                    from: 'mathpac.dev@gmail.com',
                    subject: 'Bem vindo à minha loja!',
                    html: '<h1>Você foi cadastrado com sucesso.</h1> <p>Faça login na loja e comece suas compras agora mesmo!</p>'
                })
                .catch(errorHandler(next));
            });
    })
    })
}

exports.GetLogin = (req, res, next) => {
    res.render('login', {
        path: '/login',
        pageTitle: "Login",
        errorMessage: req.flash('error')[0],
        oldInput: {email: ''},
        validationErrors: []
    });
}

exports.PostLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

   /* if(!errors.isEmpty()){
        console.log(errors.array());
        return res.status(422).render('login', {
            path: '/login',
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {email: email},
            validationErrors: errors.array()
        });
    } */

    User.findOne({
        where: {
            email: email,
        }
    })
    .then(user => {
        if(user){
            bcrypt.compare(password, user.password)
            .then(doMatch => {
                if(doMatch){
                    console.log("Encontrou um usuário. Nome: " + user.name);
                    req.session.user = user;
                    req.session.isLoggedIn = true;
                    req.session.save(() =>{
                        res.redirect('/');
                    })
                }else{
                    req.flash('error', 'E-mail ou senha inválido.');
                    req.session.save(() => {
                        console.log("Senha incorreta.");
                        res.redirect('/login');
                    }) 
                }
            })
            .catch(errorHandler(next));
        }else{
            req.flash('error', 'E-mail ou senha inválido.');
            req.session.save(() => {
                console.log("Nenhum usuário encontrado.");
                res.redirect('/login');
            }) 
        }
        
    })
}

exports.PostLogout = (req, res, next) => {
   req.session.destroy(() => {
       res.redirect('/');
   })
}

exports.GetResetPassword = (req, res, next) => {
    res.render('reset-password', {
        path: '/reset-password',
        pageTitle: 'Redefinir Senha',
        errorMessage: req.flash('error')[0]
    })
}

exports.PostResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (error, buffer) => {
        if(error){
            return res.redirect('/reset-password');
        }
        
        const token = buffer.toString('hex');
        User.findOne({
            where: {
                email: req.body.email,
            }
        })
        .then(user => {
            if(!user){
                req.flash('error', 'E-mail inválido.');
                req.session.save(() => {
                    console.log("Nenhum usuário encontrado.");
                    res.redirect('/reset-password');
                }) 
            }else {
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save()
                .then(result => {
                    res.redirect('/');
                    transporter.sendMail({
                        to: req.body.email,
                        from: 'mathpac.dev@gmail.com',
                        subject: 'Redefinir Senha',
                        html: `
                        <p>Voce solicitou uma nova senha.</p>
                        <p><a href="http://localhost:3000/reset-password/${token}">Clique aqui para redefinir sua senha.</a></p>
                        `
                    })
                })

            }
            
            
        })
        .catch(errorHandler(next));    })
}

exports.GetNewPassword = (req, res, next) => {
    const token = req.params.token;
    const Op = Sequelize.Op;
    User.findOne({
        where:{
            resetToken: token,
            resetTokenExpiration: {[Op.gt]: Date.now()}
        }
    })
    .then(user => {
        res.render('new-password', {
            path: '/new-password',
            pageTitle: 'Nova Senha',
            errorMessage: req.flash('error')[0],
            userId: user.id,
            passwordToken: token
            
        })
    })
    .catch(errorHandler(next));}

exports.PostNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    const Op = Sequelize.Op;
    let resetUser;

    User.findOne({
        where: {
            id: userId,
            resetToken: passwordToken,
            resetTokenExpiration: {[Op.gt]: Date.now()}
        }
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hasedPassword => {
        resetUser.password = hasedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = null;
        console.log("Senha redefinida.");
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(errorHandler(next));}