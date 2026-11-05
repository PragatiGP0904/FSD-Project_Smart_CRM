const mongoose = require('mongoose');
const { CUSTOMER_STATUSES } = require('../utils/constants');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    status: { type: String, enum: CUSTOMER_STATUSES, default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

customerSchema.index({ name: 1, createdBy: 1 });

module.exports = mongoose.model('Customer', customerSchema);
