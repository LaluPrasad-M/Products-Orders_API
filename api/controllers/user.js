const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

exports.user_get_details = (req, res, next) => {
    const userData= jwt.decode(req.query.Token);
    console.log(userData.email);
    User.find({email:userData.email})
    .exec()
    .then(user => {
            if(user.length >= 1){
                res.status(200).json({
                    _id: user[0]._id,
                    email: user[0].email,
                    name: user[0].name,
                    mobileNo: user[0].mobileNo,
                    address: user[0].address
                });
            }
    })
    .catch(err =>{
        res.status(500).json({error: err}); 
    });
}

exports.user_signup = (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user =>{
        if(user.length >= 1){
            return res.status(409).json({
                message: "Email exists"
            });
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        name: req.body.name,
                        mobileNo: req.body.mobileNo,
                        address: req.body.address,
                        password: hash
                    });
                    user.save()
                    .then(result => {
                        res.status(201).json({
                            message: "User created"
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    })
}

exports.user_login =  (req, res, next) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length <1){
            return res.status(401).json({
                message: "Auth failed"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: "Auth failed"
                });
            }

            if(result){
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id,
                    mobileNo: user[0].mobileNo,
                    address: user[0].address,
                    name: user[0].name
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                });
                process.env.TOKEN = token;                
                return res.status(200).json({
                    message: "Auth successful",
                    token: token 
                });
            }

            res.status(401).json({
                message: "Auth failed"
            });
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.user_update = (req, res, next) => {

    const id = req.params.userId;
    const updateOps = {};
    updateOps[req.body.propName] = req.body.value;
    //in body => {"propName": "password","value": "newPassword"}
    User.update({_id:id}, {
        $set: updateOps
    })
    .exec()
    .then(result => {
            res.status(200).json({
            message: 'User updated',
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

exports.user_delete =  (req, res, next) =>{
    User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "User deleted"
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    })
}