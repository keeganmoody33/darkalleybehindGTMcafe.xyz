# Engineering Rules

- Prefer boring, stable architecture over cleverness.
- Start with the data model, ingestion path, normalization, deduplication, and scoring before advanced UI.
- Prefer small, composable components.
- Prefer pure functions for scoring and normalization logic.
- Prefer explicit types and interfaces.
- Prefer testable logic for nontrivial business rules.
- No silent new packages.
- No silent new external services.
- No schema changes without updating docs/BACKEND_STRUCTURE.md.
- No API contract changes without updating docs/DATA_FLOW.md and relevant docs.
- Add instrumentation/logging for ingestion jobs and scoring runs.
