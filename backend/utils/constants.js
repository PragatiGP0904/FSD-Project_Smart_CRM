const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

const ALLOWED_TRANSITIONS = {
  'New Lead': ['Contacted', 'Lost'],
  Contacted: ['Qualified', 'Lost'],
  Qualified: ['Proposal', 'Lost'],
  Proposal: ['Won', 'Lost'],
  Won: [],
  Lost: [],
};

const SOURCES = ['Website', 'Referral', 'Call', 'Social Media', 'Other'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const FOLLOW_UP_STATUSES = ['Pending', 'Completed', 'Overdue'];
const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Note'];
const CUSTOMER_STATUSES = ['Active', 'Inactive'];
const ROLES = ['admin', 'salesperson'];

const STAGE_PROBABILITY = {
  'New Lead': 10,
  Contacted: 25,
  Qualified: 45,
  Proposal: 70,
  Won: 100,
  Lost: 0,
};

const LEAD_SORTS = ['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name', 'company', '-company'];

module.exports = {
  STAGES,
  ALLOWED_TRANSITIONS,
  SOURCES,
  PRIORITIES,
  FOLLOW_UP_STATUSES,
  ACTIVITY_TYPES,
  CUSTOMER_STATUSES,
  ROLES,
  STAGE_PROBABILITY,
  LEAD_SORTS,
};
