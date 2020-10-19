const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Image = sequelize.define('image', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false, 
        primaryKey: true
    },
    path: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Image;