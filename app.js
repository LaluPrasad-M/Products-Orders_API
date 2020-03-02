const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');


mongoose.connect(
    process.env.MONGODB_URL
     , { useNewUrlParser: true, useUnifiedTopology: true  }
);
mongoose.Promise = global.Promise;
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());


//Preventing CORS errors
//to Run Client and Server on different Systems
app.use((req, res, next) => {
    res.setHeader('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','*');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods',
        'POST, GET');
        return res.status(200).json({});
    }
    next();
});


//Routes which should handle requests
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/user',userRoutes);

//Handling Errors
app.use((req,res,next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })
});


module.exports = app;