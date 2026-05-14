# Documentation Language Policy

## Principles

- Korean documentation is the default and acts as the source of truth.
- English documentation is provided as `.en.md` sidecar files in the same location.
- New root-level guides and template entrypoint READMEs should include both Korean and English versions.
- English files are companion documents. Update the Korean source first, then synchronize the English version.

## Naming

| Korean source | English companion |
|---|---|
| `README.md` | `README.en.md` |
| `decision-guide.md` | `decision-guide.en.md` |
| `template-usage-guide.md` | `template-usage-guide.en.md` |

## Required English Companion Scope

- Root user docs: `README`, `decision-guide`, `template-usage-guide`
- `scripts/README`
- `common/README`
- Each template's top-level `README`

Detailed domain docs, skill examples, and checklists remain Korean by default. Add `.en.md` in the same location when English coverage is needed.

## Validation

`npm run validate` checks that required English sidecar files exist.
