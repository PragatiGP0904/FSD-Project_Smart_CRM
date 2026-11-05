const FollowUp = require('../models/FollowUp');

async function markOverdue(userId) {
  await FollowUp.updateMany(
    { createdBy: userId, status: 'Pending', dueDate: { $lt: new Date() } },
    { $set: { status: 'Overdue' } }
  );
}

function statusForDueDate(dueDate) {
  return new Date(dueDate) < new Date() ? 'Overdue' : 'Pending';
}

module.exports = { markOverdue, statusForDueDate };
