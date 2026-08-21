# Cognitive RAG Engine UI

The UI layer for [cognitive-rag-engine](https://github.com/balakrishnan-3865/cognitive-rag-engine) — an Angular 22 standalone dashboard that connects to and interacts with the backend's RAG, agent, and document APIs. It contains no business logic of its own; the backend repo is the source of truth for how retrieval, the ReAct agent, and ingestion actually work.

Built with Angular's standalone component API (no `NgModule`s) and Tailwind CSS v4.

## Running locally

The backend must be running at `http://localhost:8080` (see the backend repo's README) — `src/environments/environment.ts` points here by default.

```bash
npm install
npm start   # dev server at http://localhost:4200, auto-reloads on change
```

```bash
npm run build   # production build to dist/
npm test        # unit tests (Vitest)
```
