const mongoose = require('mongoose');
const { ACTIVITY_TYPES } = require('../utils/constants');

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

activitySchema.index({ customerId: 1, date: -1 });
activitySchema.index({ leadId: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
