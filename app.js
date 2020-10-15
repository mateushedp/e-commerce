const express = require('express');
const bodyparser = require('body-parser');
const sequelize = require('./util/database');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer')

const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
require('dotenv').config();

const app = express();
const myStore = new SequelizeStore({
    db: sequelize,
  });
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images');
    },
    filename: (req, file, cb)=>{
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/png' ||file.mimetype === 'image/jpg' ||file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else cb(null, false);
}

app.set('views', './views');
app.set('view engine', 'ejs');

const userRoutes = require('./routes/userRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const errorController = require('./controllers/errorController');


app.use(bodyparser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).array('image', 4));
app.use(bodyparser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: myStore,
}));

myStore.sync();

app.use(csrfProtection);
app.use(flash());

app.use(express.static('public'));
app.use('/images', express.static('images'));

app.use((req, res, next) => {
    res.locals.loggedIn = req.session.isLoggedIn;
    res.locals.user = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(userRoutes);
app.use(authRoutes);
app.use('/admin', adminRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);
// app.use((error, req, res, next) => {
//     res.redirect('/500');
// });

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