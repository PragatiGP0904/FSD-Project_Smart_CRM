const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');

async function clearUserData(userId) {
  const leads = await Lead.find({ assignedTo: userId }).select('_id');
  const leadIds = leads.map((lead) => lead._id);
  const [activities, followUps, opportunities, deletedLeads, customers] = await Promise.all([
    Activity.deleteMany({ createdBy: userId }),
    FollowUp.deleteMany({ createdBy: userId }),
    Opportunity.deleteMany({ createdBy: userId }),
    Lead.deleteMany({ assignedTo: userId }),
    Customer.deleteMany({ createdBy: userId }),
  ]);

  if (leadIds.length) {
    await Promise.all([
      Activity.deleteMany({ leadId: { $in: leadIds } }),
      FollowUp.deleteMany({ leadId: { $in: leadIds } }),
      Opportunity.deleteMany({ leadId: { $in: leadIds } }),
    ]);
  }

  return {
    leads: deletedLeads.deletedCount,
    customers: customers.deletedCount,
    opportunities: opportunities.deletedCount,
    activities: activities.deletedCount,
    followUps: followUps.deletedCount,
  };
}

module.exports = { clearUserData };
