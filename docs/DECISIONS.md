# Implementation decisions

The build specification is the technical source of truth. The academic report supplies the product purpose, terminology, and required test cases. Decisions below are the places those documents do not say exactly the same thing, plus choices the specification leaves open.

## Conflicts and interpretations

1. **Follow-up statuses.** The report (section 3.5) describes Scheduled, Due Today, Overdue, and Completed. The specification and the report's own schema use `Pending`, `Overdue`, and `Completed`. Stored status follows the specification. "Due today" is a display state when the due date falls on the current calendar day. "Scheduled" in the report means `Pending`.

2. **Dashboard activity metric.** The report sometimes says "completed activities". The specification and the report's dashboard code return `totalActivities`, and the dashboard card is labelled "Activities recorded". The API field is `totalActivities`.

3. **When a lead becomes a customer.** Functional requirement FR3 says a qualified lead can be converted. Section 4.7 of the report and section 5 of the specification say a lead that reaches **Won** creates the customer, and only once. Conversion runs on Won.

4. **CSV export.** The report lists data export as future work and out of the current scope. Settings in the specification require CSV export of leads and customers. Export is implemented in the browser from the existing list APIs. There is no PDF report and no new export endpoint.

5. **Login response shape.** The general envelope is `{ success, data, count? }`. The report's login example places `token` and `user` on the top level, and the sample frontend reads them there. Register and login return `token` and `user` both at the top level and inside `data`, so either reader works. The user object uses `id`, `name`, `email`, and `role`, and never includes `passwordHash`.

6. **Registration token.** The report's register sample does not return a token. Register still returns a token so the interface can open the workspace immediately. The password is stored only as a bcrypt hash, and `role` in the body is rejected with 400.

7. **Delete all data.** Settings needs a danger-zone action that the endpoint table does not list. `DELETE /api/auth/data` removes the signed-in user's leads, customers, opportunities, activities, and follow-ups. It does not delete the user account.

8. **Deleting a lead.** The specification requires deleting the lead's activities. Follow-ups and opportunities that point at that lead are deleted as well, so the workspace does not keep records whose parent is gone. A customer created when the lead was Won is kept.

9. **Extra fields.** `Lead.stageUpdatedAt` records when the stage last changed so pipeline cards can show age in stage. `FollowUp.context.lastInteractionAt` stores the date of the interaction used to build context, so the card can say "2 days ago". Both are additions; the required context fields `name`, `stage`, and `lastInteraction` are unchanged.

10. **Repository root.** The specification tree is rooted at `Smart-CRM/`. This workspace is the repository root, with `backend/`, `frontend/`, and `docs/` at the top. The GitHub repository name remains `FSD-Project_Smart_CRM`.

11. **Service layer.** The report describes a service layer. The specification's folder layout keeps business rules in controllers. Shared helpers live in `backend/utils/` (stage rules, follow-up context, overdue updates, clearing a user's data). There is no `backend/services/` package.

12. **Opportunity stages.** The allowed-move table and the error `Cannot move a lead from X to Y` apply to leads. Opportunities may be set to any of the six stages. The pipeline board is a lead board. Column value is the sum of opportunity amounts whose `leadId` is in that column.

13. **Customer history after Won.** Activities, follow-ups, and opportunities recorded against the lead remain visible on the customer profile, together with records stored directly on the customer.

14. **Contact details.** A lead or customer must have a name and at least one of email or phone. That matches test 6 and the report's create-lead sample. A follow-up, activity, or opportunity must reference exactly one of a lead or a customer.

15. **Overdue refresh.** The specification refreshes overdue follow-ups when they are listed. The same update also runs for the dashboard, a lead, and a customer profile, so counts and cards do not keep a stale Pending status.

16. **Auth rate limit while testing.** `/api/auth/*` is limited to 50 requests per 15 minutes. The limit is raised when `NODE_ENV=test` so the suite can register and log in without failing the limit.

17. **Node.js.** The specification requires Node.js 20 or newer. The report allows Node 18. The project declares `engines.node` as `>=20`.

18. **Demo follow-up time.** Arjun Kumar's follow-up is due today at 16:30, matching the card example "Due today 4:30 PM". If the seed runs after that time, listing follow-ups correctly marks it Overdue.

## Defaults chosen where the specification is silent

- List endpoints return `count` as the total number of matches, plus `page` and `pages`. Leads default to 10 per page (maximum 50). Sort defaults to newest first, and only a fixed set of fields is accepted.
- Another user's record, or an unknown id, returns 404 with "not found". The API does not use 403 for ownership.
- Changing a password requires the current password.
- Email cannot be changed after registration.
- New opportunities default to stage `New Lead`, probability 10, unless the client sends those fields.
- Search text is trimmed, length-limited, and escaped before it is used in a regular expression.
- Registering with a `role` field returns 400. The stored role is always `salesperson`.

## Visual identity

The first palette followed the specification’s blue and the stage colours green, amber, and red. That combination read as traffic lights on the cards. The working interface now uses a warm paper background, a deep green-ink primary, and muted stage tints. Overdue follow-ups are labelled in text. They no longer carry a red rail. Portraits on people and follow-up cards are generated illustrations, not photographs. The mark is two figures joined by a short line, the relationship the product is about.
