# Delivery Sanitization

## Purpose

Delivery Sanitization separates a customer-facing clean package from an internal archive after development is complete. The delivery package includes source code, tests, required documentation, licenses, and deployment artifacts while excluding AI Agent operational materials.

## When To Use

- When the project enters `pre-delivery` or `delivery-sanitization` status
- Before source delivery when agent logs, skills, harness files, inputs, and assumptions must be separated from the delivery scope
- When internal traceability must be retained while the customer package remains clean

## Delivery Package vs. Internal Archive

The delivery package is provided to the customer. The internal archive is retained for maintenance, internal audit, and traceability. Deletion is the last option, and materials with possible retention obligations should be archived.

## Principles

- Preserve the original working repository.
- Create delivery packages as separate outputs.
- Exclude AI Agent operational materials from delivery packages.
- Do not delete materials that may have contractual, audit, security, or license retention obligations.
- Mark uncertain items as `review_required`.
- Do not treat an unvalidated delivery package as complete.

## Files

| File | Description |
|---|---|
| `sanitize-policy.template.yaml` | Policy template for delivery, exclusion, and archive scopes |
| `delivery-manifest.template.yaml` | Delivery package metadata template |
| `delivery-checklist.md` | Pre-delivery checklist |
| `archive-checklist.md` | Internal archive checklist |
| `purge-checklist.md` | Approval conditions before deletion |
| `validation-rules.md` | Clean package validation rules |

## Recommended Workflow

1. Review delivery scope in `delivery/sanitize-policy.yaml`.
2. Create an internal archive with `scripts/archive-agent-workspace.mjs`.
3. Create a delivery package with `scripts/create-delivery-package.mjs`.
4. Validate the clean package with `scripts/validate-delivery-clean.mjs`.
5. Record validation results and review items in `delivery/reports/`.

## Cautions

Do not delete audit, security, or license records to hide AI Agent traces. Separate materials excluded from delivery from materials retained internally, and perform deletion only with explicit approval and policy coverage.
