const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.GetSignup = (req, res) => {
    res.render('signup', {
        path: '/signup',
        pageTitle: "Cadastro",
        errorMessage: req.flash('error')[0]
    });
}

exports.PostSignup = (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        where:{
            email: email
        }
    })
    .then(user => {
        if(!user){
            return bcrypt.hash(password, 12)
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
                    })
                    .catch(error => console.log(error));
                })
            })
            .catch(error => console.log(error));         
            
        }else{
            req.flash('error', 'E-mail já existente.');
            req.session.save(() => {
                console.log("E-mail já existente.");
                return res.redirect('/signup');  
            })  
        }
        
    })
}

exports.GetLogin = (req, res) => {
    res.render('login', {
        path: '/login',
        pageTitle: "Login",
        errorMessage: req.flash('error')[0]
    });
}

exports.PostLogin = (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    User.findOne({
        where: {
            name: name,
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
            .catch(error => console.log(error));

        }else{
            req.flash('error', 'E-mail ou senha inválido.');
            req.session.save(() => {
                console.log("Nenhum usuário encontrado.");
                res.redirect('/login');
            }) 
        }
        
    })
}

exports.PostLogout = (req, res) => {
   req.session.destroy(() => {
       res.redirect('/');
   })
}

exports.GetResetPassword = (req, res) => {
    res.render('reset-password', {
        path: '/reset-password',
        pageTitle: 'Redefinir Senha',
        errorMessage: req.flash('error')[0]
    })
}