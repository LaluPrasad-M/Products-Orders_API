const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const ProductController = require('../controllers/products')

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null,(new Date()).getTime() + file.originalname);
        // new Date().toISOString() + file.originalname
    }
});
const fileFilter = (req, file, cb) =>{
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true); //Save the file
    } else {
        cb(null, false); // Reject the file
        //instead of 'null', give "new Error('some message')" to give error if file not saved
    }
};
const upload = multer({storage: storage,limits: {
    fileSize: 1024 * 1024 *5 //In Bytes
    },
    fileFilter: fileFilter
});
//const upload = multer({dest: 'uploads/'});

router.get('/',ProductController.products_get_all);

router.get('/:pid', ProductController.products_get_product);

router.post('/', checkAuth, upload.single('productImage'), ProductController.products_create_product);

router.patch('/:pid',checkAuth, ProductController.products_patch_product);

router.delete('/:pid',checkAuth, ProductController.products_delete_product);

module.exports = router;