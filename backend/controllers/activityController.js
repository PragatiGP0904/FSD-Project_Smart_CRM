const Activity = require('../models/Activity');
const asyncHandler = require('../utils/asyncHandler');
const { pagination } = require('../utils/helpers');
const { resolveLink } = require('../utils/records');

async function attachSubjects(activities) {
  const Lead = require('../models/Lead');
  const Customer = require('../models/Customer');
  const leadIds = activities.map((item) => item.leadId).filter(Boolean);
  const customerIds = activities.map((item) => item.customerId).filter(Boolean);
  const [leads, customers] = await Promise.all([
    leadIds.length ? Lead.find({ _id: { $in: leadIds } }).select('name company') : [],
    customerIds.length ? Customer.find({ _id: { $in: customerIds } }).select('name company') : [],
  ]);
  const leadMap = new Map(leads.map((item) => [String(item._id), item]));
  const customerMap = new Map(customers.map((item) => [String(item._id), item]));

  return activities.map((activity) => {
    const plain = activity.toObject ? activity.toObject() : activity;
    const subject = plain.leadId
      ? leadMap.get(String(plain.leadId))
      : customerMap.get(String(plain.customerId));
    return {
      ...plain,
      subjectName: subject ? subject.name : '',
      subjectCompany: subject ? subject.company || '' : '',
    };
  });
}

const createActivity = asyncHandler(async (req, res) => {
  const { lead, customer } = await resolveLink({
    leadId: req.body.leadId,
    customerId: req.body.customerId,
    userId: req.user._id,
  });
  const activity = await Activity.create({
    type: req.body.type,
    description: req.body.description,
    date: req.body.date || new Date(),
    leadId: lead ? lead._id : undefined,
    customerId: customer ? customer._id : undefined,
    createdBy: req.user._id,
  });
  const [withSubject] = await attachSubjects([activity]);
  res.status(201).json({ success: true, data: withSubject });
});

const getActivities = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  if (query.leadId || query.customerId) {
    await resolveLink({
      leadId: query.leadId,
      customerId: query.customerId,
      userId: req.user._id,
    });
  }

  const filter = { createdBy: req.user._id };
  if (query.type) filter.type = query.type;
  if (query.leadId) filter.leadId = query.leadId;
  if (query.customerId) filter.customerId = query.customerId;

  const { page, limit, skip } = pagination(query, 20);
  const [count, rows] = await Promise.all([
    Activity.countDocuments(filter),
    Activity.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
  ]);
  const data = await attachSubjects(rows);

  res.status(200).json({
    success: true,
    count,
    page,
    pages: Math.ceil(count / limit) || 1,
    data,
  });
});

module.exports = { createActivity, getActivities, attachSubjects };
