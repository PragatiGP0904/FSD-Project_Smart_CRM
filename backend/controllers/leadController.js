const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const Opportunity = require('../models/Opportunity');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ALLOWED_TRANSITIONS } = require('../utils/constants');
const { escapeRegex, pagination, sortFrom, cleanString } = require('../utils/helpers');
const { findOwnedLead } = require('../utils/records');
const { markOverdue } = require('../utils/followUps');

async function applyStage(lead, stage, userId) {
  if (!stage || stage === lead.stage) return;

  const allowed = ALLOWED_TRANSITIONS[lead.stage] || [];
  if (!allowed.includes(stage)) {
    throw new AppError(`Cannot move a lead from ${lead.stage} to ${stage}`, 400);
  }

  if (stage === 'Contacted') {
    const interactions = await Activity.countDocuments({ leadId: lead._id });
    if (interactions === 0) {
      throw new AppError('Record an interaction before marking the lead as Contacted', 400);
    }
  }

  if (stage === 'Won' && !lead.customerId) {
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: 'Active',
      createdBy: userId,
    });
    lead.customerId = customer._id;
  }

  lead.stage = stage;
  lead.stageUpdatedAt = new Date();
}

const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({
    name: req.body.name,
    email: cleanString(req.body.email),
    phone: cleanString(req.body.phone),
    company: cleanString(req.body.company),
    source: req.body.source || 'Other',
    notes: req.body.notes || '',
    stage: 'New Lead',
    assignedTo: req.user._id,
    stageUpdatedAt: new Date(),
  });
  res.status(201).json({ success: true, data: lead });
});

const getLeads = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const filter = { assignedTo: req.user._id };
  if (query.stage) filter.stage = query.stage;
  if (query.source) filter.source = query.source;
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }];
  }

  const { page, limit, skip } = pagination(query, 10);
  const sort = sortFrom(query.sort, '-createdAt');
  const [count, leads] = await Promise.all([
    Lead.countDocuments(filter),
    Lead.find(filter).sort(sort).skip(skip).limit(limit).lean(),
  ]);

  const ids = leads.map((lead) => lead._id);
  const activities = ids.length
    ? await Activity.find({ leadId: { $in: ids } }).sort({ date: -1 }).lean()
    : [];
  const latest = new Map();
  activities.forEach((activity) => {
    const key = String(activity.leadId);
    if (!latest.has(key)) latest.set(key, activity);
  });

  const data = leads.map((lead) => {
    const activity = latest.get(String(lead._id));
    return {
      ...lead,
      lastActivity: activity
        ? { type: activity.type, description: activity.description, date: activity.date }
        : null,
    };
  });

  res.status(200).json({
    success: true,
    count,
    page,
    pages: Math.ceil(count / limit) || 1,
    data,
  });
});

const getLead = asyncHandler(async (req, res) => {
  await markOverdue(req.user._id);
  const lead = await findOwnedLead(req.validated.params.id, req.user._id);
  const [activities, followUps] = await Promise.all([
    Activity.find({ leadId: lead._id, createdBy: req.user._id }).sort({ date: -1 }),
    FollowUp.find({ leadId: lead._id, createdBy: req.user._id }).sort({ dueDate: 1 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...lead.toObject(),
      activities,
      followUps,
    },
  });
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await findOwnedLead(req.validated.params.id, req.user._id);
  const { name, email, phone, company, source, notes, stage } = req.body;

  if (name !== undefined) lead.name = name;
  if (email !== undefined) lead.email = email;
  if (phone !== undefined) lead.phone = phone;
  if (company !== undefined) lead.company = company;
  if (source !== undefined) lead.source = source;
  if (notes !== undefined) lead.notes = notes;

  if (!lead.email && !lead.phone) {
    throw new AppError('Name and at least one contact detail are required', 400);
  }

  await applyStage(lead, stage, req.user._id);
  await lead.save();
  res.status(200).json({ success: true, data: lead });
});

const deleteLead = asyncHandler(async (req, res) => {
  const lead = await findOwnedLead(req.validated.params.id, req.user._id);
  await Promise.all([
    Activity.deleteMany({ leadId: lead._id }),
    FollowUp.deleteMany({ leadId: lead._id }),
    Opportunity.deleteMany({ leadId: lead._id }),
  ]);
  await lead.deleteOne();
  res.status(200).json({
    success: true,
    message: `Lead '${lead.name}' deleted successfully`,
    data: { id: lead._id },
  });
});

module.exports = { createLead, getLeads, getLead, updateLead, deleteLead };
