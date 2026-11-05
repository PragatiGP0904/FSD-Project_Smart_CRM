const mongoose = require('mongoose');
const { STAGES, SOURCES } = require('../utils/constants');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    source: { type: String, enum: SOURCES, default: 'Other' },
    stage: { type: String, enum: STAGES, default: 'New Lead' },
    notes: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    stageUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leadSchema.index({ stage: 1, assignedTo: 1 });

const Lead = mongoose.model('Lead', leadSchema);
Lead.STAGES = STAGES;
module.exports = Lead;
