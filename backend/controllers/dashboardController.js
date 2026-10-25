const Lead = require('../models/Lead');
const Opportunity = require('../models/Opportunity');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const asyncHandler = require('../utils/asyncHandler');
const { STAGES } = require('../utils/constants');
const { startOfIsoWeek } = require('../utils/helpers');
const { markOverdue } = require('../utils/followUps');
const { attachSubjects } = require('./activityController');

const getDashboard = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  await markOverdue(uid);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const weekStart = startOfIsoWeek(now);
  const rangeStart = new Date(weekStart);
  rangeStart.setDate(rangeStart.getDate() - 7 * 7);

  const [
    totalLeads,
    activeOpportunities,
    pendingFollowUps,
    totalActivities,
    stageAgg,
    valueAgg,
    upcomingFollowUps,
    recentRows,
    rangedLeads,
    leadsThisWeek,
    leadsPrevWeek,
    activitiesThisWeek,
    activitiesPrevWeek,
    opportunitiesThisWeek,
    opportunitiesPrevWeek,
  ] = await Promise.all([
    Lead.countDocuments({ assignedTo: uid }),
    Opportunity.countDocuments({ createdBy: uid, stage: { $nin: ['Won', 'Lost'] } }),
    FollowUp.countDocuments({ createdBy: uid, status: { $in: ['Pending', 'Overdue'] } }),
    Activity.countDocuments({ createdBy: uid }),
    Lead.aggregate([
      { $match: { assignedTo: uid } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]),
    Opportunity.aggregate([
      { $match: { createdBy: uid, stage: { $nin: ['Won', 'Lost'] } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]),
    FollowUp.find({ createdBy: uid, status: { $in: ['Pending', 'Overdue'] } })
      .sort({ dueDate: 1 })
      .limit(5),
    Activity.find({ createdBy: uid }).sort({ date: -1 }).limit(6),
    Lead.find({ assignedTo: uid, createdAt: { $gte: rangeStart } }).select('createdAt'),
    Lead.countDocuments({ assignedTo: uid, createdAt: { $gte: weekAgo } }),
    Lead.countDocuments({ assignedTo: uid, createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
    Activity.countDocuments({ createdBy: uid, date: { $gte: weekAgo } }),
    Activity.countDocuments({ createdBy: uid, date: { $gte: twoWeeksAgo, $lt: weekAgo } }),
    Opportunity.countDocuments({ createdBy: uid, createdAt: { $gte: weekAgo } }),
    Opportunity.countDocuments({ createdBy: uid, createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }),
  ]);

  const stageDistribution = {};
  STAGES.forEach((stage) => {
    stageDistribution[stage] = 0;
  });
  stageAgg.forEach((row) => {
    if (row._id) stageDistribution[row._id] = row.count;
  });

  const leadsOverTime = [];
  for (let index = 0; index < 8; index += 1) {
    const start = new Date(rangeStart);
    start.setDate(rangeStart.getDate() + index * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    leadsOverTime.push({
      weekStart: start.toISOString(),
      count: rangedLeads.filter((lead) => lead.createdAt >= start && lead.createdAt < end).length,
    });
  }

  const recentActivities = await attachSubjects(recentRows);

  res.status(200).json({
    success: true,
    data: {
      totalLeads,
      activeOpportunities,
      pendingFollowUps,
      totalActivities,
      stageDistribution,
      pipelineValue: valueAgg[0]?.total || 0,
      upcomingFollowUps,
      recentActivities,
      leadsOverTime,
      trends: {
        leads: { current: leadsThisWeek, previous: leadsPrevWeek },
        activities: { current: activitiesThisWeek, previous: activitiesPrevWeek },
        opportunities: { current: opportunitiesThisWeek, previous: opportunitiesPrevWeek },
      },
    },
  });
});

module.exports = { getDashboard };
