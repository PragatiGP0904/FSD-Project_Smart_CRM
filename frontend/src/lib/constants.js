export const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

export const ALLOWED_TRANSITIONS = {
  'New Lead': ['Contacted', 'Lost'],
  Contacted: ['Qualified', 'Lost'],
  Qualified: ['Proposal', 'Lost'],
  Proposal: ['Won', 'Lost'],
  Won: [],
  Lost: [],
};

export const SOURCES = ['Website', 'Referral', 'Call', 'Social Media', 'Other'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const ACTIVITY_TYPES = ['Call', 'Meeting', 'Email', 'Note'];
export const CUSTOMER_STATUSES = ['Active', 'Inactive'];

export const STAGE_VAR = {
  'New Lead': 'var(--stage-new)',
  Contacted: 'var(--stage-contacted)',
  Qualified: 'var(--stage-qualified)',
  Proposal: 'var(--stage-proposal)',
  Won: 'var(--stage-won)',
  Lost: 'var(--stage-lost)',
  Customer: 'var(--stage-contacted)',
};

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/leads', label: 'Leads', icon: 'Users' },
  { to: '/customers', label: 'Customers', icon: 'Contact' },
  { to: '/pipeline', label: 'Pipeline', icon: 'Kanban' },
  { to: '/activities', label: 'Activities', icon: 'MessagesSquare' },
  { to: '/follow-ups', label: 'Follow-ups', icon: 'CalendarClock' },
  { to: '/settings', label: 'Settings', icon: 'Settings' },
];
