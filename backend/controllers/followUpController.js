const FollowUp = require('../models/FollowUp');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { pagination, assertObjectId } = require('../utils/helpers');
const { resolveLink, buildContext } = require('../utils/records');
const { markOverdue, statusForDueDate } = require('../utils/followUps');

const rank = { Overdue: 0, Pending: 1, Completed: 2 };

function sortFollowUps(items) {
  return items.sort((a, b) => {
    const statusOrder = rank[a.status] - rank[b.status];
    if (statusOrder !== 0) return statusOrder;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

const createFollowUp = asyncHandler(async (req, res) => {
  const { lead, customer } = await resolveLink({
    leadId: req.body.leadId,
    customerId: req.body.customerId,
    userId: req.user._id,
  });
  const context = await buildContext({ lead, customer });
  const followUp = await FollowUp.create({
    title: req.body.title,
    dueDate: req.body.dueDate,
    priority: req.body.priority || 'Medium',
    status: statusForDueDate(req.body.dueDate),
    leadId: lead ? lead._id : undefined,
    customerId: customer ? customer._id : undefined,
    context,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: followUp });
});

const getFollowUps = asyncHandler(async (req, res) => {
  await markOverdue(req.user._id);
  const query = req.validated.query;
  const filter = { createdBy: req.user._id };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  const { page, limit, skip } = pagination(query, 50);
  const rows = await FollowUp.find(filter);
  const sorted = sortFollowUps(rows);
  const data = sorted.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    count: sorted.length,
    page,
    pages: Math.ceil(sorted.length / limit) || 1,
    data,
  });
});

const updateFollowUp = asyncHandler(async (req, res) => {
  assertObjectId(req.validated.params.id, 'Follow-up');
  const item = await FollowUp.findOne({
    _id: req.validated.params.id,
    createdBy: req.user._id,
  });
  if (!item) throw new AppError('Follow-up not found', 404);

  if (req.body.title !== undefined) item.title = req.body.title;
  if (req.body.priority !== undefined) item.priority = req.body.priority;
  if (req.body.dueDate !== undefined) item.dueDate = req.body.dueDate;

  if (req.body.status === 'Completed') {
    item.status = 'Completed';
    item.completedAt = item.completedAt || new Date();
  } else if (req.body.status === 'Pending' || req.body.status === 'Overdue' || req.body.dueDate) {
    if (item.status !== 'Completed' || req.body.status === 'Pending' || req.body.status === 'Overdue') {
      item.completedAt = req.body.status === 'Completed' ? item.completedAt : null;
      if (req.body.status !== 'Completed') {
        item.status = statusForDueDate(item.dueDate);
        item.completedAt = null;
      }
    }
  }

  await item.save();
  res.status(200).json({ success: true, data: item });
});

const completeFollowUp = asyncHandler(async (req, res) => {
  assertObjectId(req.validated.params.id, 'Follow-up');
  const item = await FollowUp.findOne({
    _id: req.validated.params.id,
    createdBy: req.user._id,
  });
  if (!item) throw new AppError('Follow-up not found', 404);
  item.status = 'Completed';
  item.completedAt = item.completedAt || new Date();
  await item.save();
  res.status(200).json({ success: true, data: item });
});

module.exports = { createFollowUp, getFollowUps, updateFollowUp, completeFollowUp };
