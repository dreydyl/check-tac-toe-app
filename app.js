var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var handlebars = require('express-handlebars');
// var sessions = require('express-session');

var indexRouter = require('./routes/index');

const app = express();

app.engine(
    "hbs",
    handlebars({
        layoutsDir: path.join(__dirname,"views/layouts"),
        partialsDir: path.join(__dirname,"views/partials"),
        extname: ".hbs",
        defaultLayout: "home",
        helpers: {}
    })
);

app.set("view engine", "hbs");
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

module.exports = app;