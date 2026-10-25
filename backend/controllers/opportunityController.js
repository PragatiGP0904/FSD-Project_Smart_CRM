const Opportunity = require('../models/Opportunity');
const asyncHandler = require('../utils/asyncHandler');
const { STAGE_PROBABILITY } = require('../utils/constants');
const { pagination, escapeRegex } = require('../utils/helpers');
const { resolveLink } = require('../utils/records');
const AppError = require('../utils/AppError');
const { assertObjectId } = require('../utils/helpers');

const createOpportunity = asyncHandler(async (req, res) => {
  const { lead, customer } = await resolveLink({
    leadId: req.body.leadId,
    customerId: req.body.customerId,
    userId: req.user._id,
  });
  const stage = req.body.stage || 'New Lead';
  const opportunity = await Opportunity.create({
    title: req.body.title,
    value: req.body.value,
    stage,
    probability: req.body.probability ?? STAGE_PROBABILITY[stage] ?? 10,
    expectedCloseDate: req.body.expectedCloseDate,
    leadId: lead ? lead._id : undefined,
    customerId: customer ? customer._id : undefined,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: opportunity });
});

const getOpportunities = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  if (query.leadId || query.customerId) {
    await resolveLink({
      leadId: query.leadId,
      customerId: query.customerId,
      userId: req.user._id,
    });
  }

  const filter = { createdBy: req.user._id };
  if (query.stage) filter.stage = query.stage;
  if (query.leadId) filter.leadId = query.leadId;
  if (query.customerId) filter.customerId = query.customerId;
  if (query.search) {
    filter.title = new RegExp(escapeRegex(query.search), 'i');
  }

  const { page, limit, skip } = pagination(query, 10);
  const [count, data] = await Promise.all([
    Opportunity.countDocuments(filter),
    Opportunity.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
  ]);

  res.status(200).json({
    success: true,
    count,
    page,
    pages: Math.ceil(count / limit) || 1,
    data,
  });
});

const updateOpportunity = asyncHandler(async (req, res) => {
  assertObjectId(req.validated.params.id, 'Opportunity');
  const opportunity = await Opportunity.findOne({
    _id: req.validated.params.id,
    createdBy: req.user._id,
  });
  if (!opportunity) throw new AppError('Opportunity not found', 404);

  ['title', 'value', 'stage', 'probability', 'expectedCloseDate'].forEach((field) => {
    if (req.body[field] !== undefined) opportunity[field] = req.body[field];
  });
  if (req.body.stage && req.body.probability === undefined) {
    opportunity.probability = STAGE_PROBABILITY[req.body.stage] ?? opportunity.probability;
  }
  await opportunity.save();
  res.status(200).json({ success: true, data: opportunity });
});

const deleteOpportunity = asyncHandler(async (req, res) => {
  assertObjectId(req.validated.params.id, 'Opportunity');
  const opportunity = await Opportunity.findOneAndDelete({
    _id: req.validated.params.id,
    createdBy: req.user._id,
  });
  if (!opportunity) throw new AppError('Opportunity not found', 404);
  res.status(200).json({
    success: true,
    message: `Opportunity '${opportunity.title}' deleted successfully`,
    data: { id: opportunity._id },
  });
});

module.exports = { createOpportunity, getOpportunities, updateOpportunity, deleteOpportunity };
