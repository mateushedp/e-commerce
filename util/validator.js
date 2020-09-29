const {check} = require('express-validator/check');
const User = require('../models/User');

exports.validateSignup = [
    check('email')
    .isEmail().withMessage('Insira um e-mail válido')
    .custom((value, {req}) => {
        return User.findOne({where:{email: value}})
        .then(userDoc => {
            if(userDoc){
                return Promise.reject('E-mail já existente');
            }
        });
    })
    .normalizeEmail()
    .trim(),
    check('password', 'Senha muito curta')
    .isLength({min: 6})
    .trim(),
    check('confirmPassword')
    .custom((value, {req}) => {
        if(value!==req.body.password){
            throw new Error('Senhas precisam estar iguais');
        }
        return true;
    })
    .trim()
];

exports.validateAddProduct = [
    check('title')
    .isString().withMessage('Insira apenas numeros e letras no campo Título')
    .trim(),

    check('price')
    .isFloat().withMessage('Insira apenas numeros no campo Preço')
    .trim()

];

exports.validateEditProduct = [
    check('title')
    .isString().withMessage('Insira apenas numeros e letras no campo Título')
    .trim(),

    check('price')
    .isFloat().withMessage('Insira apenas numeros no campo Preço')
    .trim()

];