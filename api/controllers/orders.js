const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user')
const jwt = require('jsonwebtoken');

exports.orders_get_all = (req, res, next) => {
    const userData= jwt.decode(req.query.Token);
    Order.find({userId: userData.userId})
    .select("_id product quantity")
    .populate('product','name price productImage')
    .populate('userId','name')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    product: doc.product,
                    quantity: doc.quantity,
                    user: doc.userId,
                    OrderID: doc._id,
                    request: {
                        type: "GET",
                        url: 'https://shielded-sands-75274.herokuapp.com/orders/'+doc._id+'?Token='+process.env.TOKEN
                    }
                }
            })
        };
        res.status(200).json(response);
    }) 
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.oid)
    .select("_id quantity product")
    .populate('product')
    .exec()
    .then(order => {
        if(!order){
            return res.status(404).json({
                message: 'Order not found'
            })
        }
        res.status(200).json({
            order: order,
            request:{
                type: 'GET',
                url: 'https://shielded-sands-75274.herokuapp.com/orders?Token='+process.env.TOKEN
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {   
        if(!product){
            return res.status(404).json({
                message: "product not found"
            });
        } 
        if(product.quantityAvailable < req.body.quantity){
            return res.status(500).json({
                message: "products not in stock"
            });
        }
        const userData= jwt.decode(req.query.Token);
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.params.pid,
            userId: userData.userId
        });
        var qtyOrdered = req.body.quantity || 1;
        Product.update({_id: req.params.pid},{
            $inc: {quantityAvailable : -qtyOrdered}
        })
        .exec();
        
        return order.save()
    })
    .then(result => {
        res.status(201).json({
            message: "Order Stored",
            createdOrder: {
                product: result.product,
                quantity: result.quantity,
                _id: result._id,
                userId: result.userId,
                request: {
                    type: 'GET',
                    url: 'https://shielded-sands-75274.herokuapp.com/orders/'+result._id+'?Token='+process.env.TOKEN
                }
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.orders_delete_orders = (req, res, next) => {
    Order.remove({_id: req.params.oid})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Order: ' + req.params.oid + ' is Deleted!',
            request: {
                type: 'POST',
                url: 'https://shielded-sands-75274.herokuapp.com/orders?Token='+process.env.TOKEN,
                body: { productId: 'ID', quantity: 'Number'}
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
}