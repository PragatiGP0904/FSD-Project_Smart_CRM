const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createActivitySchema, listActivitySchema } = require('../validators/schemas');
const { createActivity, getActivities } = require('../controllers/activityController');

const router = express.Router();

router.use(protect);
router.route('/').get(validate(listActivitySchema), getActivities).post(validate(createActivitySchema), createActivity);

module.exports = router;
