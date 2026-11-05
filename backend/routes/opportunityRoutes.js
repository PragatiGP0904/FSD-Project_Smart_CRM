const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  createOpportunitySchema,
  updateOpportunitySchema,
  listOpportunitySchema,
  idParamSchema,
} = require('../validators/schemas');
const {
  createOpportunity,
  getOpportunities,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');

const router = express.Router();

router.use(protect);
router.route('/').get(validate(listOpportunitySchema), getOpportunities).post(validate(createOpportunitySchema), createOpportunity);
router
  .route('/:id')
  .put(validate(updateOpportunitySchema), updateOpportunity)
  .delete(validate(idParamSchema), deleteOpportunity);

module.exports = router;
