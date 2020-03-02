const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const OrderController = require('../controllers/orders');

router.get('/',checkAuth, OrderController.orders_get_all);

router.get('/:oid',checkAuth, OrderController.orders_get_order);

router.post('/:pid',checkAuth, OrderController.orders_create_order);

router.delete('/:oid',checkAuth, OrderController.orders_delete_orders);

module.exports = router;