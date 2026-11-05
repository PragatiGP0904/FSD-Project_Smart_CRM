const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const AppError = require('./AppError');
const { assertObjectId } = require('./helpers');

async function findOwnedLead(id, userId) {
  assertObjectId(id, 'Lead');
  const lead = await Lead.findOne({ _id: id, assignedTo: userId });
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
}

async function findOwnedCustomer(id, userId) {
  assertObjectId(id, 'Customer');
  const customer = await Customer.findOne({ _id: id, createdBy: userId });
  if (!customer) throw new AppError('Customer not found', 404);
  return customer;
}

async function resolveLink({ leadId, customerId, userId }) {
  if (leadId && customerId) {
    throw new AppError('Provide either a lead or a customer', 400);
  }
  if (!leadId && !customerId) {
    throw new AppError('Provide either a lead or a customer', 400);
  }
  if (leadId) {
    const lead = await findOwnedLead(leadId, userId);
    return { lead, customer: null };
  }
  const customer = await findOwnedCustomer(customerId, userId);
  return { lead: null, customer };
}

async function buildContext({ lead, customer }) {
  const filter = lead ? { leadId: lead._id } : { customerId: customer._id };
  const last = await Activity.findOne(filter).sort({ date: -1, createdAt: -1 });
  return {
    name: (lead || customer).name,
    stage: lead ? lead.stage : 'Customer',
    lastInteraction: last ? `${last.type}: ${last.description}` : 'No interaction recorded yet',
    lastInteractionAt: last ? last.date : undefined,
  };
}

module.exports = {
  findOwnedLead,
  findOwnedCustomer,
  resolveLink,
  buildContext,
};
