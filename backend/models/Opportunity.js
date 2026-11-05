const mongoose = require('mongoose');
const { STAGES } = require('../utils/constants');

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    value: { type: Number, required: true, min: 0 },
    stage: { type: String, enum: STAGES, default: 'New Lead' },
    probability: { type: Number, min: 0, max: 100, default: 10 },
    expectedCloseDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

opportunitySchema.index({ customerId: 1, stage: 1 });
opportunitySchema.index({ leadId: 1, stage: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
