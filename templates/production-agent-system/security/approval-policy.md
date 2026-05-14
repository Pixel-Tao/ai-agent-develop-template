# Approval Policy

Human approval is required before high-risk or destructive actions.

Approval-required examples:

- file deletion beyond generated artifacts
- production database writes or migrations
- permission changes
- deployments
- payments
- external message sending

Approval records must include action, risk level, requester, approver, timestamp, and audit event id.

The template implementation lives in `src/security/approval-gate.ts`. Use `assertApproved()` for high and destructive actions. Approval failures return structured security errors and record `approval.requested` audit events.
