var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expresshbs = require('express-handlebars');
var session = require('express-session');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var validator = require('express-validator');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var app = express();
var MongoStore = require('connect-mongo')(session);


//mongoose connect
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Ekart');
require('./config/passport');

// view engine setup
app.engine('.hbs', expresshbs({defaultLayout: 'layout.hbs', extname: '.hbs'}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/admin/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 180*60*1000}
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', (req, res, next)=>{
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});


app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
