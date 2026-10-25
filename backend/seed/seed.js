require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');
const Activity = require('../models/Activity');
const FollowUp = require('../models/FollowUp');
const { clearUserData } = require('../utils/clearUserData');
const { buildContext } = require('../utils/records');
const { statusForDueDate } = require('../utils/followUps');

const daysAgo = (days, hours = 11, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const todayAt = (hours, minutes) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const leadRows = [
  ['Vikram Nair', 'vikram@nairlogistics.in', '9845100101', 'Nair Logistics', 'Referral', 'Won', 'Annual contract signed after the depot visit.'],
  ['Lakshmi Rao', 'lakshmi@raoorganics.in', '9845100102', 'Rao Organics', 'Website', 'Won', 'First supply order confirmed for the Coimbatore store.'],
  ['Imran Qureshi', 'imran@qureshiprints.in', '9845100103', 'Qureshi Prints', 'Call', 'Won', 'Festival print run is in production.'],
  ['Sneha Kulkarni', 'sneha@kulkarnistudio.in', '9845100104', 'Kulkarni Studio', 'Social Media', 'Won', 'Brand refresh approved.'],
  ['Arjun Kumar', 'arjun@kumarinteriors.in', '9811122233', 'Kumar Interiors', 'Referral', 'Proposal', 'Quotation sent for the office renovation.'],
  ['Neha Bansal', 'neha@bansalsweets.in', '9845100202', 'Bansal Sweets', 'Website', 'Proposal', 'Hamper quotation shared before Diwali.'],
  ['Karthik Subramanian', 'karthik@subraelectricals.in', '9845100203', 'Subra Electricals', 'Call', 'Proposal', 'Rewiring proposal for the T Nagar showroom.'],
  ['Pooja Jain', 'pooja@jainlearning.in', '9845100204', 'Jain Learning', 'Referral', 'Proposal', 'Lab furniture quotation under review.'],
  ['Ananya Shah', 'ananya@shahdental.in', '9822012345', 'Shah Dental Clinic', 'Social Media', 'Qualified', 'Needs a fit-out before the new branch opens.'],
  ['Rahul Mehta', 'rahul@mehtapackaging.in', '9845100302', 'Mehta Packaging', 'Website', 'Qualified', 'Asked for carton pricing at three volumes.'],
  ['Deepa Nambiar', 'deepa@nambiartravels.in', '9845100303', 'Nambiar Travels', 'Referral', 'Qualified', 'Wants a retained desk for corporate bookings.'],
  ['Sanjay Gupta', 'sanjay@guptastationery.in', '9845100304', 'Gupta Stationery', 'Call', 'Qualified', 'Comparing our notebook range with a local printer.'],
  ['Rohan Desai', 'rohan@desaicatering.in', '9845000111', 'Desai Catering', 'Call', 'Contacted', 'Wedding season enquiry from a family referral.'],
  ['Fatima Sheikh', 'fatima@sheikhfabrics.in', '9845100402', 'Sheikh Fabrics', 'Social Media', 'Contacted', 'Asked for linen swatches.'],
  ['Arvind Joshi', 'arvind@joshiprinters.in', '9845100403', 'Joshi Printers', 'Website', 'Contacted', 'Needs a service visit for two presses.'],
  ['Nandini Iyer', 'nandini@iyercakes.in', '9845100404', 'Iyer Cakes', 'Referral', 'Contacted', 'Looking for weekend corporate orders.'],
  ['Meera Iyer', 'meera@iyertextiles.in', '9845100501', 'Iyer Textiles', 'Website', 'New Lead', 'Downloaded the wholesale catalogue.'],
  ['Aditya Rao', 'aditya@raosolar.in', '9845100502', 'Rao Solar', 'Call', 'New Lead', 'Missed call returned from the website number.'],
  ['Sana Qureshi', 'sana@qureshiboutique.in', '9845100503', 'Qureshi Boutique', 'Social Media', 'New Lead', 'Commented on the festive lookbook.'],
  ['Manoj Pillai', 'manoj@pillaiseafood.in', '9845100504', 'Pillai Seafood', 'Other', 'New Lead', 'Met at the Kochi trade counter.'],
  ['Ritu Agarwal', 'ritu@agarwaltuition.in', '9845100505', 'Agarwal Tuition', 'Website', 'New Lead', 'Enquiry form for printed workbooks.'],
  ['Harish Patel', 'harish@patelhardware.in', '9845100601', 'Patel Hardware', 'Call', 'Lost', 'Chose a supplier closer to the godown.'],
  ['Kavya Reddy', 'kavya@reddyevents.in', '9845100602', 'Reddy Events', 'Referral', 'Lost', 'Event date moved and the budget was cut.'],
  ['Omar Farooq', 'omar@farooqautos.in', '9845100603', 'Farooq Autos', 'Website', 'Lost', 'No response after the third call.'],
];

const directCustomers = [
  ['Farhan Ali', 'farhan@alispice.in', '9845200101', 'Ali Spice Co', 'Active'],
  ['Divya Menon', 'divya@menonclinics.in', '9845200102', 'Menon Clinics', 'Active'],
  ['Geeta Kulkarni', 'geeta@kulkarniboutique.in', '9845200103', 'Kulkarni Boutique', 'Active'],
  ['Nikhil Shah', 'nikhil@shahlogistics.in', '9845200104', 'Shah Logistics', 'Inactive'],
];

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set. Add it to backend/.env before running npm run seed.');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Add it to backend/.env before running npm run seed.');
  }

  await connectDB();

  const email = 'demo@smartcrm.com';
  let user = await User.findOne({ email }).select('+passwordHash');
  const passwordHash = await bcrypt.hash('Demo@123', 10);
  if (user) {
    await clearUserData(user._id);
    user.name = 'Pragati GP';
    user.passwordHash = passwordHash;
    user.role = 'salesperson';
    await user.save();
  } else {
    user = await User.create({ name: 'Pragati GP', email, passwordHash, role: 'salesperson' });
  }

  const customerByLead = {};
  const wonNames = ['Vikram Nair', 'Lakshmi Rao', 'Imran Qureshi', 'Sneha Kulkarni'];
  for (const name of wonNames) {
    const row = leadRows.find((item) => item[0] === name);
    const customer = await Customer.create({
      name: row[0],
      email: row[1],
      phone: row[2],
      company: row[3],
      status: 'Active',
      createdBy: user._id,
    });
    customerByLead[name] = customer;
  }

  const extraCustomers = [];
  for (const [name, mail, phone, company, status] of directCustomers) {
    extraCustomers.push(await Customer.create({ name, email: mail, phone, company, status, createdBy: user._id }));
  }

  const leads = {};
  for (const [name, mail, phone, company, source, stage, notes] of leadRows) {
    const stageAge = name === 'Arjun Kumar' ? 5 : (name.length % 9) + 1;
    const createdAt = daysAgo((name.length % 45) + 1, 10, 0);
    const lead = await Lead.create({
      name,
      email: mail,
      phone,
      company,
      source,
      stage,
      notes,
      assignedTo: user._id,
      customerId: customerByLead[name]?._id,
      stageUpdatedAt: daysAgo(stageAge, 9, 15),
    });
    await Lead.collection.updateOne({ _id: lead._id }, { $set: { createdAt } });
    lead.createdAt = createdAt;
    leads[name] = lead;
  }

  const explicitActivities = [
    ['Arjun Kumar', 'Call', 'Introduced the studio and asked about the office renovation', 18],
    ['Arjun Kumar', 'Email', 'Sent the preliminary layout options', 9],
    ['Arjun Kumar', 'Meeting', 'Quotation discussed with the customer', 2],
    ['Vikram Nair', 'Meeting', 'Walked through the depot and confirmed the annual volume', 21],
    ['Vikram Nair', 'Email', 'Sent the signed rate card', 6],
    ['Lakshmi Rao', 'Call', 'Confirmed the first millet shipment for Coimbatore', 14],
    ['Imran Qureshi', 'Meeting', 'Approved the festive print colours', 11],
    ['Sneha Kulkarni', 'Email', 'Shared the final brand refresh files', 8],
    ['Neha Bansal', 'Meeting', 'Tasted the sample hampers and noted the dry-fruit mix', 4],
    ['Karthik Subramanian', 'Call', 'Collected the showroom load details', 7],
    ['Pooja Jain', 'Email', 'Sent the lab furniture quotation', 3],
    ['Ananya Shah', 'Meeting', 'Measured the new clinic and discussed chair delivery', 12],
    ['Rahul Mehta', 'Call', 'Reviewed carton volumes for the export order', 6],
    ['Deepa Nambiar', 'Email', 'Shared a sample corporate booking desk rota', 5],
    ['Sanjay Gupta', 'Call', 'Compared notebook GSM and cover options', 9],
    ['Rohan Desai', 'Call', 'Noted the wedding date and guest count', 2],
    ['Fatima Sheikh', 'Email', 'Sent linen swatches by courier', 4],
    ['Arvind Joshi', 'Call', 'Booked a technician visit for the two presses', 1],
    ['Nandini Iyer', 'Meeting', 'Discussed weekend corporate cake orders', 3],
    ['Harish Patel', 'Call', 'Heard that a nearer supplier won the hardware order', 16],
    ['Kavya Reddy', 'Note', 'Budget was reduced after the venue change', 13],
    ['Omar Farooq', 'Call', 'Left a third message about the service package', 20],
    ['Meera Iyer', 'Note', 'Catalogue download noted from the website form', 1],
    ['Ritu Agarwal', 'Email', 'Sent the workbook samples and asked her to confirm receipt', 6],
    ['Aditya Rao', 'Call', 'Discussed the rooftop capacity and the next site visit', 3],
    ['Farhan Ali', 'customer', 'Call', 'Asked for a festival spice hamper price', 3],
    ['Divya Menon', 'customer', 'Meeting', 'Reviewed the retained support hours with the clinic manager', 4],
  ];

  for (const row of explicitActivities) {
    if (row[1] === 'customer') {
      const customer = extraCustomers.find((item) => item.name === row[0]);
      await Activity.create({
        type: row[2],
        description: row[3],
        date: daysAgo(row[4], 15, 10),
        customerId: customer._id,
        createdBy: user._id,
      });
    } else {
      await Activity.create({
        type: row[1],
        description: row[2],
        date: daysAgo(row[3], 15, 10),
        leadId: leads[row[0]]._id,
        createdBy: user._id,
      });
    }
  }

  const fillerLeads = Object.values(leads);
  const fillerTypes = ['Call', 'Email', 'Note', 'Meeting'];
  const fillerNotes = [
    'Confirmed the best time to speak this week',
    'Shared a short proposal outline',
    'Noted a question about delivery timing',
    'Agreed to send references from a similar job',
    'Checked whether the decision maker is available',
    'Recorded a change in the requested quantity',
  ];
  let guard = 0;
  while ((await Activity.countDocuments({ createdBy: user._id })) < 40) {
    const lead = fillerLeads[guard % fillerLeads.length];
    await Activity.create({
      type: fillerTypes[guard % fillerTypes.length],
      description: fillerNotes[guard % fillerNotes.length],
      date: daysAgo(21 + (guard % 40), 12, guard % 50),
      leadId: lead._id,
      createdBy: user._id,
    });
    guard += 1;
    if (guard > 80) break;
  }

  const opportunityRows = [
    ['Office renovation quotation', 'Arjun Kumar', null, 240000, 'Proposal', 70, 12],
    ['Festive hamper supply', 'Neha Bansal', null, 85000, 'Proposal', 65, 18],
    ['Showroom rewiring', 'Karthik Subramanian', null, 150000, 'Proposal', 60, 20],
    ['Learning lab furniture', 'Pooja Jain', null, 120000, 'Proposal', 55, 25],
    ['Clinic fit-out', 'Ananya Shah', null, 320000, 'Qualified', 45, 30],
    ['Export carton run', 'Rahul Mehta', null, 64000, 'Qualified', 40, 22],
    ['Annual logistics contract', 'Vikram Nair', 'Vikram Nair', 410000, 'Won', 100, -4],
    ['Millet supply order', 'Lakshmi Rao', 'Lakshmi Rao', 95000, 'Won', 100, -2],
    ['Wedding catering', 'Rohan Desai', null, 180000, 'Contacted', 25, 40],
    ['Festival spice hampers', null, 'Farhan Ali', 72000, 'Qualified', 50, 15],
  ];

  for (const [title, leadName, customerName, value, stage, probability, closeIn] of opportunityRows) {
    const close = new Date();
    close.setDate(close.getDate() + closeIn);
    await Opportunity.create({
      title,
      value,
      stage,
      probability,
      expectedCloseDate: close,
      leadId: leadName ? leads[leadName]._id : undefined,
      customerId: customerName
        ? (customerByLead[customerName] || extraCustomers.find((item) => item.name === customerName))._id
        : undefined,
      createdBy: user._id,
    });
  }

  const followRows = [
    ['Call to check whether the quotation is acceptable', 'Arjun Kumar', null, 'High', todayAt(16, 30), false],
    ['Confirm hamper quantities with the store manager', 'Neha Bansal', null, 'Medium', todayAt(11, 0), false],
    ['Send the revised clinic layout', 'Ananya Shah', null, 'High', daysAgo(2, 10, 0), false],
    ['Ask about the press service visit', 'Arvind Joshi', null, 'Medium', daysAgo(3, 16, 0), false],
    ['Check whether the workbook samples arrived', 'Ritu Agarwal', null, 'Low', daysAgo(5, 9, 30), false],
    ['Share two venue references', 'Kavya Reddy', null, 'Low', daysAgo(1, 18, 0), true],
    ['Call about the corporate booking desk', 'Deepa Nambiar', null, 'Medium', daysAgo(-2, 10, 30), false],
    ['Send swatch photos that were requested', 'Fatima Sheikh', null, 'High', daysAgo(-1, 15, 0), false],
    ['Review the solar enquiry notes', 'Aditya Rao', null, 'Low', daysAgo(-4, 11, 15), false],
    ['Introduce the retained support plan', null, 'Divya Menon', 'Medium', daysAgo(-6, 16, 45), false],
    ['Close the rate card follow-up', 'Vikram Nair', null, 'Low', daysAgo(8, 13, 0), true],
    ['Confirm the millet delivery window', 'Lakshmi Rao', null, 'Medium', daysAgo(4, 12, 20), true],
  ];

  for (const [title, leadName, customerName, priority, dueDate, completed] of followRows) {
    const lead = leadName ? leads[leadName] : null;
    const customer = customerName ? extraCustomers.find((item) => item.name === customerName) : null;
    const context = await buildContext({ lead, customer });
    await FollowUp.create({
      title,
      dueDate,
      priority,
      status: completed ? 'Completed' : statusForDueDate(dueDate),
      completedAt: completed ? daysAgo(1, 17, 0) : undefined,
      leadId: lead ? lead._id : undefined,
      customerId: customer ? customer._id : undefined,
      context,
      createdBy: user._id,
    });
  }

  const [leadCount, customerCount, opportunityCount, activityCount, followCount] = await Promise.all([
    Lead.countDocuments({ assignedTo: user._id }),
    Customer.countDocuments({ createdBy: user._id }),
    Opportunity.countDocuments({ createdBy: user._id }),
    Activity.countDocuments({ createdBy: user._id }),
    FollowUp.countDocuments({ createdBy: user._id }),
  ]);

  if (leadCount !== 24 || customerCount !== 8 || opportunityCount !== 10 || activityCount !== 40 || followCount !== 12) {
    throw new Error(
      `Seed counts were ${leadCount} leads, ${customerCount} customers, ${opportunityCount} opportunities, ${activityCount} activities, ${followCount} follow-ups`
    );
  }

  const arjun = await FollowUp.findOne({ createdBy: user._id, title: 'Call to check whether the quotation is acceptable' });
  if (!arjun || arjun.context.lastInteraction !== 'Meeting: Quotation discussed with the customer' || arjun.priority !== 'High') {
    throw new Error('Arjun Kumar follow-up context was not stored correctly');
  }

  console.log('Seed complete for demo@smartcrm.com');
  console.log('Password: Demo@123');
  console.log(`${leadCount} leads, ${customerCount} customers, ${opportunityCount} opportunities, ${activityCount} activities, ${followCount} follow-ups`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
