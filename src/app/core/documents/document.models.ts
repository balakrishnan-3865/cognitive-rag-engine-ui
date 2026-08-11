// Client-side layer over documents. Upload/new-version are real backend calls; version
// switch/delete remain mocked (see PHASES.md Phase 2 "Parked" — no version-history API yet).

import { DocumentIngestionStatus } from '../../models/types';

export interface DocVersion {
  id: number;
  label: string; // v1, v2, ...
  createdAt: string;
}

export interface Doc {
  id: number; // real documentId returned by POST /documents/upload, or GET /documents
  title: string;
  status: DocumentIngestionStatus;
  versions: DocVersion[];
  activeVersionId: number;
}
