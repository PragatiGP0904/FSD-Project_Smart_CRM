import { AxiosError } from 'axios';

export const DEMO_SESSION_KEY = 'crm_demo_session';
export const DEMO_USER = {
  _id: 'demo-user',
  name: 'Pragati GP',
  email: 'demo@smartcrm.com',
  role: 'salesperson',
};

const daysFromNow = (days, hours = 11) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

const leads = [
  { _id: 'lead-arjun', name: 'Arjun Kumar', email: 'arjun@kumarinteriors.in', phone: '9811122233', company: 'Kumar Interiors', source: 'Referral', stage: 'Proposal', notes: 'Quotation sent for the office renovation.', createdAt: daysFromNow(-15), stageUpdatedAt: daysFromNow(-5), lastActivity: { type: 'Meeting', description: 'Quotation discussed with the customer', date: daysFromNow(-2) } },
  { _id: 'lead-neha', name: 'Neha Bansal', email: 'neha@bansalsweets.in', phone: '9845100202', company: 'Bansal Sweets', source: 'Website', stage: 'Proposal', notes: 'Hamper quotation shared before Diwali.', createdAt: daysFromNow(-12), stageUpdatedAt: daysFromNow(-4), lastActivity: { type: 'Meeting', description: 'Tasted the sample hampers', date: daysFromNow(-3) } },
  { _id: 'lead-karthik', name: 'Karthik Subramanian', email: 'karthik@subraelectricals.in', phone: '9845100203', company: 'Subra Electricals', source: 'Call', stage: 'Proposal', notes: 'Rewiring proposal for the T Nagar showroom.', createdAt: daysFromNow(-10), stageUpdatedAt: daysFromNow(-3), lastActivity: { type: 'Call', description: 'Collected the showroom load details', date: daysFromNow(-2) } },
  { _id: 'lead-pooja', name: 'Pooja Jain', email: 'pooja@jainlearning.in', phone: '9845100204', company: 'Jain Learning', source: 'Referral', stage: 'Proposal', notes: 'Lab furniture quotation under review.', createdAt: daysFromNow(-9), stageUpdatedAt: daysFromNow(-3), lastActivity: { type: 'Email', description: 'Sent the lab furniture quotation', date: daysFromNow(-1) } },
  { _id: 'lead-ananya', name: 'Ananya Shah', email: 'ananya@shahdental.in', phone: '9822012345', company: 'Shah Dental Clinic', source: 'Social Media', stage: 'Qualified', notes: 'Needs a fit-out before the new branch opens.', createdAt: daysFromNow(-8), stageUpdatedAt: daysFromNow(-2), lastActivity: { type: 'Meeting', description: 'Measured the new clinic', date: daysFromNow(-2) } },
  { _id: 'lead-rahul', name: 'Rahul Mehta', email: 'rahul@mehtapackaging.in', phone: '9845100302', company: 'Mehta Packaging', source: 'Website', stage: 'Qualified', notes: 'Asked for carton pricing at three volumes.', createdAt: daysFromNow(-7), stageUpdatedAt: daysFromNow(-2), lastActivity: { type: 'Call', description: 'Reviewed carton volumes for the export order', date: daysFromNow(-1) } },
  { _id: 'lead-rohan', name: 'Rohan Desai', email: 'rohan@desaicatering.in', phone: '9845000111', company: 'Desai Catering', source: 'Call', stage: 'Contacted', notes: 'Wedding season enquiry from a family referral.', createdAt: daysFromNow(-6), stageUpdatedAt: daysFromNow(-1), lastActivity: { type: 'Call', description: 'Noted the wedding date and guest count', date: daysFromNow(-1) } },
  { _id: 'lead-meera', name: 'Meera Iyer', email: 'meera@iyertextiles.in', phone: '9845100501', company: 'Iyer Textiles', source: 'Website', stage: 'New Lead', notes: 'Downloaded the wholesale catalogue.', createdAt: daysFromNow(-1), stageUpdatedAt: daysFromNow(-1), lastActivity: null },
];

const customers = [
  { _id: 'customer-vikram', name: 'Vikram Nair', email: 'vikram@nairlogistics.in', phone: '9845100101', company: 'Nair Logistics', status: 'Active', createdAt: daysFromNow(-22) },
  { _id: 'customer-lakshmi', name: 'Lakshmi Rao', email: 'lakshmi@raoorganics.in', phone: '9845100102', company: 'Rao Organics', status: 'Active', createdAt: daysFromNow(-17) },
  { _id: 'customer-imran', name: 'Imran Qureshi', email: 'imran@qureshiprints.in', phone: '9845100103', company: 'Qureshi Prints', status: 'Active', createdAt: daysFromNow(-13) },
  { _id: 'customer-farhan', name: 'Farhan Ali', email: 'farhan@alispice.in', phone: '9845200101', company: 'Ali Spice Co', status: 'Active', createdAt: daysFromNow(-8) },
  { _id: 'customer-divya', name: 'Divya Menon', email: 'divya@menonclinics.in', phone: '9845200102', company: 'Menon Clinics', status: 'Inactive', createdAt: daysFromNow(-4) },
];

const activities = [
  { _id: 'activity-arjun', type: 'Meeting', description: 'Quotation discussed with the customer', date: daysFromNow(-2), leadId: 'lead-arjun', subjectName: 'Arjun Kumar', subjectCompany: 'Kumar Interiors' },
  { _id: 'activity-neha', type: 'Meeting', description: 'Tasted the sample hampers and noted the dry-fruit mix', date: daysFromNow(-3), leadId: 'lead-neha', subjectName: 'Neha Bansal', subjectCompany: 'Bansal Sweets' },
  { _id: 'activity-rohan', type: 'Call', description: 'Noted the wedding date and guest count', date: daysFromNow(-1), leadId: 'lead-rohan', subjectName: 'Rohan Desai', subjectCompany: 'Desai Catering' },
  { _id: 'activity-vikram', type: 'Email', description: 'Sent the signed rate card', date: daysFromNow(-4), customerId: 'customer-vikram', subjectName: 'Vikram Nair', subjectCompany: 'Nair Logistics' },
  { _id: 'activity-ananya', type: 'Meeting', description: 'Measured the new clinic and discussed chair delivery', date: daysFromNow(-2), leadId: 'lead-ananya', subjectName: 'Ananya Shah', subjectCompany: 'Shah Dental Clinic' },
];

const followUps = [
  { _id: 'follow-arjun', title: 'Call to check whether the quotation is acceptable', dueDate: daysFromNow(0, 16), priority: 'High', status: 'Pending', leadId: 'lead-arjun', context: { name: 'Arjun Kumar', company: 'Kumar Interiors', stage: 'Proposal', lastInteraction: 'Meeting: Quotation discussed with the customer', lastInteractionAt: daysFromNow(-2) } },
  { _id: 'follow-neha', title: 'Confirm hamper quantities for the first order', dueDate: daysFromNow(1, 11), priority: 'Medium', status: 'Pending', leadId: 'lead-neha', context: { name: 'Neha Bansal', company: 'Bansal Sweets', stage: 'Proposal', lastInteraction: 'Meeting: Tasted the sample hampers', lastInteractionAt: daysFromNow(-3) } },
  { _id: 'follow-karthik', title: 'Ask for the final showroom measurements', dueDate: daysFromNow(-1, 10), priority: 'Low', status: 'Overdue', leadId: 'lead-karthik', context: { name: 'Karthik Subramanian', company: 'Subra Electricals', stage: 'Proposal', lastInteraction: 'Call: Collected the showroom load details', lastInteractionAt: daysFromNow(-2) } },
  { _id: 'follow-vikram', title: 'Check the first delivery schedule', dueDate: daysFromNow(2, 14), priority: 'Medium', status: 'Pending', customerId: 'customer-vikram', context: { name: 'Vikram Nair', company: 'Nair Logistics', stage: 'Won', lastInteraction: 'Email: Sent the signed rate card', lastInteractionAt: daysFromNow(-4) } },
];

const opportunities = [
  { _id: 'opp-arjun', title: 'Kumar Interiors office renovation', value: 125000, stage: 'Proposal', probability: 60, expectedCloseDate: daysFromNow(14), leadId: 'lead-arjun' },
  { _id: 'opp-neha', title: 'Bansal Sweets festive hampers', value: 48000, stage: 'Proposal', probability: 60, expectedCloseDate: daysFromNow(10), leadId: 'lead-neha' },
  { _id: 'opp-ananya', title: 'Shah Dental new branch fit-out', value: 210000, stage: 'Qualified', probability: 40, expectedCloseDate: daysFromNow(28), leadId: 'lead-ananya' },
  { _id: 'opp-vikram', title: 'Nair Logistics annual contract', value: 320000, stage: 'Won', probability: 100, expectedCloseDate: daysFromNow(-5), customerId: 'customer-vikram' },
];

const stageDistribution = {
  'New Lead': 1,
  Contacted: 1,
  Qualified: 2,
  Proposal: 4,
  Won: 4,
  Lost: 3,
};

const dashboard = {
  totalLeads: 15,
  activeOpportunities: 3,
  pendingFollowUps: 4,
  totalActivities: 28,
  stageDistribution,
  pipelineValue: 383000,
  upcomingFollowUps: followUps.slice(0, 3),
  recentActivities: activities.slice(0, 5),
  leadsOverTime: Array.from({ length: 8 }, (_, index) => ({
    weekStart: daysFromNow(-49 + index * 7),
    count: [1, 2, 1, 3, 2, 4, 1, 1][index],
  })),
  trends: {
    leads: { current: 3, previous: 2 },
    activities: { current: 5, previous: 3 },
    opportunities: { current: 2, previous: 1 },
  },
};

function listResponse(rows, params) {
  let filtered = [...rows];
  if (params.search) {
    const search = String(params.search).toLowerCase();
    filtered = filtered.filter((row) => Object.values(row).some((value) => String(value || '').toLowerCase().includes(search)));
  }
  ['stage', 'source', 'status', 'type', 'priority'].forEach((key) => {
    if (params[key]) filtered = filtered.filter((row) => row[key] === params[key]);
  });
  const count = filtered.length;
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 50);
  return { success: true, count, page, pages: Math.ceil(count / limit) || 1, data: filtered.slice((page - 1) * limit, page * limit) };
}

function detailFor(rows, id, related = {}) {
  const record = rows.find((row) => row._id === id);
  if (!record) return { success: false, message: 'Record not found' };
  return { success: true, data: { ...record, ...related } };
}

function sampleData(path, params) {
  if (path === '/auth/me') return { success: true, data: DEMO_USER };
  if (path === '/dashboard') return { success: true, data: dashboard };
  if (path === '/leads') return listResponse(leads, params);
  if (path.startsWith('/leads/')) {
    const lead = leads.find((item) => item._id === path.slice('/leads/'.length));
    const related = lead ? {
      activities: activities.filter((item) => item.leadId === lead._id),
      followUps: followUps.filter((item) => item.leadId === lead._id),
    } : {};
    return detailFor(leads, path.slice('/leads/'.length), related);
  }
  if (path === '/customers') return listResponse(customers, params);
  if (path.startsWith('/customers/')) {
    const id = path.slice('/customers/'.length);
    return detailFor(customers, id, {
      leads: [],
      activities: activities.filter((item) => item.customerId === id),
      followUps: followUps.filter((item) => item.customerId === id),
      opportunities: opportunities.filter((item) => item.customerId === id),
    });
  }
  if (path === '/followups') return listResponse(followUps, params);
  if (path === '/activities') return listResponse(activities, params);
  if (path === '/opportunities') return listResponse(opportunities, params);
  return null;
}

export function isDemoSession() {
  return localStorage.getItem(DEMO_SESSION_KEY) === 'true';
}

export function createDemoResponse(config) {
  const url = new URL(config.url, config.baseURL || window.location.origin);
  const path = url.pathname.replace(/\/api$/, '').replace(/^\/api(?=\/)/, '') || '/';
  const method = (config.method || 'get').toLowerCase();
  const data = sampleData(path, config.params || {});
  const response = {
    config,
    data: data || { success: false, message: `No sample data is available for ${path}.` },
    headers: {},
    request: null,
    status: data ? 200 : 404,
    statusText: data ? 'OK' : 'Not Found',
  };

  if (method !== 'get') {
    response.data = { success: false, message: 'Sample demo is read-only. Changes are not saved.' };
    response.status = 403;
    response.statusText = 'Forbidden';
    return Promise.reject(new AxiosError(response.data.message, 'ERR_BAD_REQUEST', config, null, response));
  }
  return Promise.resolve(response);
}
