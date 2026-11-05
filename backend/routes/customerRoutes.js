const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createCustomerSchema, updateCustomerSchema, listCustomerSchema, idParamSchema } = require('../validators/schemas');
const { createCustomer, getCustomers, getCustomer, updateCustomer } = require('../controllers/customerController');

const router = express.Router();

router.use(protect);
router.route('/').get(validate(listCustomerSchema), getCustomers).post(validate(createCustomerSchema), createCustomer);
router.route('/:id').get(validate(idParamSchema), getCustomer).put(validate(updateCustomerSchema), updateCustomer);

module.exports = router;
