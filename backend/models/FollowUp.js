const mongoose = require('mongoose');
const { PRIORITIES, FOLLOW_UP_STATUSES } = require('../utils/constants');

const followUpSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: FOLLOW_UP_STATUSES, default: 'Pending' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    context: {
      name: { type: String, default: '' },
      stage: { type: String, default: '' },
      lastInteraction: { type: String, default: 'No interaction recorded yet' },
      lastInteractionAt: { type: Date },
    },
    completedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

followUpSchema.index({ status: 1, dueDate: 1 });
followUpSchema.index({ createdBy: 1, status: 1, dueDate: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
