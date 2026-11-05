const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createFollowUpSchema, updateFollowUpSchema, listFollowUpSchema, idParamSchema } = require('../validators/schemas');
const { createFollowUp, getFollowUps, updateFollowUp, completeFollowUp } = require('../controllers/followUpController');

const router = express.Router();

router.use(protect);
router.route('/').get(validate(listFollowUpSchema), getFollowUps).post(validate(createFollowUpSchema), createFollowUp);
router.put('/:id', validate(updateFollowUpSchema), updateFollowUp);
router.patch('/:id/complete', validate(idParamSchema), completeFollowUp);

module.exports = router;
