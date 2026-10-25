const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const Opportunity = require('../models/Opportunity');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { escapeRegex, pagination, sortFrom, cleanString } = require('../utils/helpers');
const { findOwnedCustomer } = require('../utils/records');
const { markOverdue } = require('../utils/followUps');

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({
    name: req.body.name,
    email: cleanString(req.body.email),
    phone: cleanString(req.body.phone),
    company: cleanString(req.body.company),
    status: req.body.status || 'Active',
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: customer });
});

const getCustomers = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const filter = { createdBy: req.user._id };
  if (query.status) filter.status = query.status;
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }];
  }

  const { page, limit, skip } = pagination(query, 10);
  const [count, data] = await Promise.all([
    Customer.countDocuments(filter),
    Customer.find(filter).sort(sortFrom(query.sort, '-createdAt')).skip(skip).limit(limit),
  ]);

  res.status(200).json({
    success: true,
    count,
    page,
    pages: Math.ceil(count / limit) || 1,
    data,
  });
});

const getCustomer = asyncHandler(async (req, res) => {
  await markOverdue(req.user._id);
  const customer = await findOwnedCustomer(req.validated.params.id, req.user._id);
  const leads = await Lead.find({ customerId: customer._id, assignedTo: req.user._id }).select('_id name stage');
  const leadIds = leads.map((lead) => lead._id);
  const related = {
    createdBy: req.user._id,
    $or: [{ customerId: customer._id }, { leadId: { $in: leadIds } }],
  };

  const [activities, followUps, opportunities] = await Promise.all([
    Activity.find(related).sort({ date: -1 }),
    FollowUp.find(related).sort({ dueDate: 1 }),
    Opportunity.find(related).sort({ updatedAt: -1 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...customer.toObject(),
      leads,
      activities,
      followUps,
      opportunities,
    },
  });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await findOwnedCustomer(req.validated.params.id, req.user._id);
  const { name, email, phone, company, status } = req.body;
  if (name !== undefined) customer.name = name;
  if (email !== undefined) customer.email = email;
  if (phone !== undefined) customer.phone = phone;
  if (company !== undefined) customer.company = company;
  if (status !== undefined) customer.status = status;
  if (!customer.email && !customer.phone) {
    throw new AppError('Name and at least one contact detail are required', 400);
  }
  await customer.save();
  res.status(200).json({ success: true, data: customer });
});

module.exports = { createCustomer, getCustomers, getCustomer, updateCustomer };
