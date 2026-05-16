# Delivery Sanitization Guide

## Overview

This guide explains how to separate a customer-facing delivery package from an internal archive when development is complete.

## Outputs

- `dist/delivery/`: customer-facing clean package
- `dist/internal-archive/`: internal archive
- `delivery/reports/`: validation results and review items

## Procedure

1. Update `delivery/sanitize-policy.yaml`.
2. Run `node scripts/archive-agent-workspace.mjs --policy delivery/sanitize-policy.yaml --output dist/internal-archive`.
3. Run `node scripts/create-delivery-package.mjs --policy delivery/sanitize-policy.yaml --output dist/delivery`.
4. Run `node scripts/validate-delivery-clean.mjs --package <zip> --policy delivery/sanitize-policy.yaml`.
5. Fix failed items or leave them under `review_required`.

## Decision Criteria

The delivery package must be clean and internal traceability must be retained. Archiving is preferred over deletion, and validation is preferred over unchecked automation.
