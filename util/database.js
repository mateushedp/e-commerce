const Sequelize = require('sequelize');
const sequelize = new Sequelize('ecommerce', 'root', 'cocozin32', {
    dialect: 'mysql', 
    host: 'localhost',
    logging: false
});

module.exports = sequelize;