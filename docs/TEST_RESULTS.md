# Test results

Generated from the Jest and Vitest runs. A row is PASS only when that run reported the test as passed.

| Test | Result |
| --- | --- |
| 6. Create a lead with a name and no contact detail returns a validation error | PASS |
| 7. Create a lead with valid data saves it in New Lead stage | PASS |
| 8. Move a lead from New Lead to Proposal returns 400 | PASS |
| 9. Mark a lead Contacted with no activity returns 400 | PASS |
| 10. Move a Proposal lead to Won sets the stage and creates a customer | PASS |
| 11. Read another user's lead by id returns 404 | PASS |
| 12. Schedule a follow-up for a lead stores stage and last interaction | PASS |
| 13. Fetch follow-ups after the due date shows the pending item as Overdue | PASS |
| 14. Mark a follow-up completed sets status Completed | PASS |
| 1. Register with a new e-mail creates a user; password stored only as a hash | PASS |
| 2. Register with an existing e-mail returns 400 | PASS |
| 3. Login with valid credentials returns token and user | PASS |
| 4. Login with a wrong password returns 401 | PASS |
| 5. Protected route without a token returns 401 | PASS |
| 15. Dashboard counts and stage distribution match the data | PASS |
| 16. Layout adapts at phone width; navigation stays usable | PASS |

## Additional automated tests

| Test | Result |
| --- | --- |
| deleting a lead removes its activities | PASS |
| registration rejects a role sent by the client | PASS |
| lead, interaction, won customer, context follow-up and dashboard stay in step | PASS |
| creates, lists and updates a customer owned by the user | PASS |
| hides another user customer | PASS |
| records an interaction against an owned lead | PASS |
| rejects an activity with no lead or customer | PASS |
| creates an opportunity only for an owned lead | PASS |
| Context follow-up card shows the customer, stage, last interaction, and next action | PASS |

## Case 16 notes

The automated check renders the app shell and confirms the phone navigation control, primary links, and command menu are present.

Manual inspection of the running app on 25 Oct 2026:

| Check | Result |
| --- | --- |
| 390px width: navigation opens from the menu button and records render as cards | PASS |
| 768px width: sidebar is visible and the menu button is hidden | PASS |
| Desktop width: sidebar, tables, pipeline, dashboard, and follow-ups render | PASS |
| Dark mode on the pipeline, customers, and lead profile | PASS |
| Demo login, lead search, command search, and completing a follow-up | PASS |
| Pipeline drag with a pointer | Not verified in the browser. Stage rules are covered by API tests 8, 9, and 10. |

## Run status

- Backend Jest: success true, passed 23, failed 0, total 23.
- Frontend Vitest: success true, passed 2, failed 0, total 2.
- Numbered cases missing from the report: none.
- A later combined `npm test` was stopped while it was downloading MongoDB 7.0.24. The backend rows are from the completed Jest run. The frontend rows are from the Vitest run after the UI fixes.
