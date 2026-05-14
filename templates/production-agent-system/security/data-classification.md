# Data Classification

| Class | Examples | Default handling |
|---|---|---|
| public | Public docs, public code examples | Allowed in logs if useful. |
| internal | Project docs, internal design notes | Avoid external exposure. |
| source-code | Proprietary source code | Do not send externally without approval. |
| pii | Name, email, address, identifiers | Redact unless explicitly required. |
| secret | API key, token, credential, private key | Never log raw value. |
| financial | Payment or account data | Approval required. |
| health | Health-related data | Approval and compliance review required. |

The starter classifier lives in `src/security/data-classifier.ts`. It is deterministic and designed for tests and policy gates; production deployments should extend it for domain-specific identifiers.
