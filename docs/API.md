# Smart CRM API

Base URL in local development: `http://localhost:5000`

All JSON responses use one of these shapes:

```json
{ "success": true, "data": {}, "count": 0, "page": 1, "pages": 1 }
```

```json
{ "success": false, "message": "What went wrong and what to do" }
```

Register and login also place `token` and `user` on the top level, matching the project report. Protected routes expect `Authorization: Bearer <token>`. A missing or invalid token returns `401`. Another user's record returns `404`.

Passwords are stored only as bcrypt hashes. `passwordHash` is never returned.

## Health

`GET /health` — public

```json
{ "success": true, "status": "OK" }
```

## Auth

Rate limited to 50 requests per 15 minutes.

### POST /api/auth/register

```json
{ "name": "Asha Menon", "email": "asha@example.com", "password": "secret1" }
```

`201`

```json
{
  "success": true,
  "token": "<jwt>",
  "user": { "id": "67148ab59efc2d102cbfda89", "name": "Asha Menon", "email": "asha@example.com", "role": "salesperson" }
}
```

Sending `role` returns `400` with `Role cannot be set during registration`. A duplicate email returns `400` with `A user with this email already exists`.

### POST /api/auth/login

```json
{ "email": "demo@smartcrm.com", "password": "Demo@123" }
```

`200` returns `token` and `user`. A wrong password returns `401` with `Invalid email or password`.

### GET /api/auth/me

`200` `{ "success": true, "data": { "id", "name", "email", "role" } }`

### PUT /api/auth/me

Update the name, the password, or both. A new password requires `currentPassword`.

```json
{ "name": "Pragati GP" }
```

```json
{ "currentPassword": "Demo@123", "password": "new-secret" }
```

### DELETE /api/auth/data

Deletes the signed-in user's leads, customers, opportunities, activities, and follow-ups. The account remains.

## Leads

### GET /api/leads

Query: `stage`, `source`, `search`, `page`, `limit` (max 50), `sort` (`createdAt`, `-createdAt`, `name`, `-name`, `company`, `-company`, `updatedAt`, `-updatedAt`).

Each lead includes `lastActivity`: `{ type, description, date }` or `null`.

### POST /api/leads

```json
{
  "name": "Meera Iyer",
  "email": "meera@iyertextiles.in",
  "phone": "9845100501",
  "company": "Iyer Textiles",
  "source": "Website",
  "notes": "Downloaded the wholesale catalogue."
}
```

Name and at least one of email or phone are required. Stage is always `New Lead`. `201` returns the lead.

### GET /api/leads/:id

Returns the lead plus `activities` and `followUps`.

### PUT /api/leads/:id

Update contact fields, notes, source, or `stage`.

Allowed moves:

| From | To |
| --- | --- |
| New Lead | Contacted, Lost |
| Contacted | Qualified, Lost |
| Qualified | Proposal, Lost |
| Proposal | Won, Lost |
| Won or Lost | none |

Anything else returns `400` and `Cannot move a lead from X to Y`.

Moving to Contacted with no activity returns `400` and `Record an interaction before marking the lead as Contacted`.

Moving to Won creates one customer (name, email, phone, company, status `Active`) and stores `customerId` on the lead. A second Won save does not create another customer.

### DELETE /api/leads/:id

Deletes the lead and its activities, follow-ups, and opportunities. A customer already created from that lead is kept.

## Customers

### GET /api/customers

Query: `search`, `status`, `page`, `limit`, `sort`.

### POST /api/customers

```json
{ "name": "Farhan Ali", "email": "farhan@alispice.in", "company": "Ali Spice Co", "status": "Active" }
```

Name and at least one contact detail are required.

### GET /api/customers/:id

Profile with `activities`, `opportunities`, `followUps`, and converted `leads`. History recorded on the lead before it was won is included.

### PUT /api/customers/:id

Updates name, email, phone, company, and status.

## Opportunities

### GET /api/opportunities

Query: `stage`, `leadId`, `customerId`, `search`, `page`, `limit`.

### POST /api/opportunities

```json
{
  "title": "Office renovation quotation",
  "value": 240000,
  "stage": "Proposal",
  "probability": 70,
  "expectedCloseDate": "2026-11-20",
  "leadId": "<lead id>"
}
```

Provide exactly one of `leadId` or `customerId`. The referenced record must belong to the signed-in user. Value is in INR.

### PUT /api/opportunities/:id

Updates title, value, stage, probability, and expected close date. Opportunity stages are not limited to the lead transition table.

### DELETE /api/opportunities/:id

Deletes that opportunity.

## Activities

### GET /api/activities

Query: `type` (`Call`, `Meeting`, `Email`, `Note`), `leadId`, `customerId`, `page`, `limit`.

Each item includes `subjectName` and `subjectCompany`.

### POST /api/activities

```json
{
  "type": "Meeting",
  "description": "Quotation discussed with the customer",
  "date": "2026-10-23T10:00:00.000Z",
  "leadId": "<lead id>"
}
```

Provide exactly one of `leadId` or `customerId`.

## Follow-ups

### GET /api/followups

Before the list is returned, pending follow-ups whose due date has passed are marked `Overdue`. Query: `status`, `priority`, `page`, `limit`. Overdue items are ordered first.

### POST /api/followups

```json
{
  "title": "Call to check whether the quotation is acceptable",
  "dueDate": "2026-10-25T11:00:00.000Z",
  "priority": "High",
  "leadId": "<lead id>"
}
```

The server stores context. Client-supplied context is ignored.

```json
{
  "context": {
    "name": "Arjun Kumar",
    "stage": "Proposal",
    "lastInteraction": "Meeting: Quotation discussed with the customer",
    "lastInteractionAt": "2026-10-23T10:00:00.000Z"
  }
}
```

For a customer, `stage` is `Customer`. If there is no activity, `lastInteraction` is `No interaction recorded yet`.

### PUT /api/followups/:id

Updates title, due date, priority, or status. Sending `status: "Pending"` clears completion and recalculates Pending or Overdue from the due date. This is how undo works.

### PATCH /api/followups/:id/complete

Sets `status` to `Completed` and `completedAt` to the current time.

## Dashboard

### GET /api/dashboard

```json
{
  "success": true,
  "data": {
    "totalLeads": 24,
    "activeOpportunities": 6,
    "pendingFollowUps": 9,
    "totalActivities": 40,
    "stageDistribution": {
      "New Lead": 5,
      "Contacted": 4,
      "Qualified": 4,
      "Proposal": 4,
      "Won": 4,
      "Lost": 3
    },
    "pipelineValue": 1231000,
    "upcomingFollowUps": [],
    "recentActivities": [],
    "leadsOverTime": [{ "weekStart": "2026-09-01T00:00:00.000Z", "count": 3 }],
    "trends": {
      "leads": { "current": 2, "previous": 1 },
      "activities": { "current": 4, "previous": 3 },
      "opportunities": { "current": 1, "previous": 0 }
    }
  }
}
```

`activeOpportunities` counts opportunities whose stage is not Won or Lost. `pendingFollowUps` counts Pending and Overdue. `pipelineValue` sums the value of those open opportunities. `upcomingFollowUps` is the next five open follow-ups. `recentActivities` is the latest six. `leadsOverTime` is the last eight weeks, including weeks with zero leads.
