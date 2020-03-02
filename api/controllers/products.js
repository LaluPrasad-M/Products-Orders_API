const mongoose = require('mongoose');
const Product = require('../models/product');  

exports.products_get_all = (req, res, next) => {
    Product.find()
    .select("name price _id productImage quantityAvailable")
    .exec()
    .then(docs => {
        res.setHeader("myName","Lalu");
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: 'https://shielded-sands-75274.herokuapp.com/'+doc.productImage,
                    quantityAvailable: doc.quantityAvailable,
                    _id: doc._id,
                    request: {
                        type: "GET",
                        url: 'https://shielded-sands-75274.herokuapp.com/products/'+doc._id
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

exports.products_get_product = (req, res, next) => {
    const id = req.params.pid;
    res.setHeader("myName",req.headers.myName);
    Product.findById(id)
    .select("name price _id productImage quantityAvailable")
    .exec()
    .then(doc => {
            if(doc){
                res.status(200).json({
                    product: {
                        _id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        quantityAvailable: doc.quantityAvailable,
                        productImage: 'https://shielded-sands-75274.herokuapp.com/' + doc.productImage
                    },
                    request: {
                        type: 'GET',
                        url: 'https://shielded-sands-75274.herokuapp.com/products'
                    }
                });
            } else {
                res.status(404).json({message: "No Valid entry found for provided ID"});
            }
    })
    .catch(err =>{
        res.status(500).json({error: err}); 
    });

}

exports.products_create_product =  (req, res, next) => {
    const product = new Product(
        {
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        quantityAvailable: req.body.quantityAvailable,
        productImage: req.file.path
    });
    product.save()
    .then(result => {
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct : {
                name: result.name,
                price: result.price,
                quantityAvailable: result.quantityAvailable,
                _id: result.id,
                request: {
                    type: "POST",
                    url: 'https://shielded-sands-75274.herokuapp.com/products/'+result._id
                }
            }
        });
    }) 
    .catch(err => {
        res.status(500).json({
        error: err
        });
    });    
}

exports.products_patch_product = (req, res, next) => {
    const id = req.params.pid;
    const updateOps = {};
    updateOps[req.body.propName] = req.body.value;
    //in body => {"propName": "password","value": "newPassword"}
    Product.update({_id:id}, {
        $set: updateOps
    })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product updated',
            request:{
                type: 'GET',
                url: 'https://shielded-sands-75274.herokuapp.com/products/'+id
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error:err
        })
    });   
}

exports.products_delete_product = (req, res, next) => {
    const id = req.params.pid;
    Product.remove({_id:id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product Deleted',
            request: {
                type: 'POST',
                url: 'https://shielded-sands-75274.herokuapp.com/products?Token='+process.env.TOKEN,
                body: { name: 'String', price: 'Number'}
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });

}