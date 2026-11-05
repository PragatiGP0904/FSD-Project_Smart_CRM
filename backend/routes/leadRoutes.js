const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createLeadSchema,
  updateLeadSchema,
  listLeadSchema,
  idParamSchema,
} = require('../validators/schemas');
const { createLead, getLeads, getLead, updateLead, deleteLead } = require('../controllers/leadController');

const router = express.Router();

router.use(protect);
router.route('/').get(validate(listLeadSchema), getLeads).post(validate(createLeadSchema), createLead);
router
  .route('/:id')
  .get(validate(idParamSchema), getLead)
  .put(validate(updateLeadSchema), updateLead)
  .delete(validate(idParamSchema), deleteLead);

module.exports = router;
