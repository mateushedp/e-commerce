const express = require('express');
const bodyparser = require('body-parser');
const sequelize = require('./util/database');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');

const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

const app = express();
const myStore = new SequelizeStore({
    db: sequelize,
  });
const csrfProtection = csrf();

app.set('views', './views');
app.set('view engine', 'ejs');

const userRoutes = require('./routes/userRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');


app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(session({
    secret:'uma string longa',
    resave: false,
    saveUninitialized: false,
    store: myStore,
}));

myStore.sync();

app.use(csrfProtection);
app.use(flash());

app.use(express.static('public'));

app.use((req, res, next) => {
    res.locals.loggedIn = req.session.isLoggedIn;
    res.locals.user = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(userRoutes);
app.use(authRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
    res.status(404);
    res.write("ERRO!");
    res.end();
});

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem});


sequelize
    //.sync({force: true})
    .sync()
    .then(result => {
        app.listen(3000, () => {
            console.log('Escutando na porta 3000');
        })
    })
    .catch(error => {
        console.log(error);
    })