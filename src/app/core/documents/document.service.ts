import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DocumentListItem, DocumentUploadResponse } from '../../models/types';
import { Doc, DocVersion } from './document.models';

const DOCUMENTS_BASE = `${environment.apiBaseUrl}/api/v1/documents`;

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_FILENAME_LENGTH = 255;
export const MAX_EXTENSION_LENGTH = 10;

export function validatePdfFile(file: File): string | null {
  if (file.size === 0) return 'File is empty.';
  if (file.size > MAX_FILE_SIZE_BYTES) return 'File exceeds the 20MB size limit.';
  if (file.name.length > MAX_FILENAME_LENGTH) return 'Filename is too long.';
  const dotIndex = file.name.lastIndexOf('.');
  if (dotIndex === -1) return 'Filename is missing an extension.';
  const extension = file.name.slice(dotIndex + 1);
  if (extension.length > MAX_EXTENSION_LENGTH) return 'File extension is too long.';
  if (extension.toLowerCase() !== 'pdf' || file.type !== 'application/pdf') {
    return 'Only PDF files are supported.';
  }
  return null;
}

let nextVersionId = 1;

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);

  private readonly docsSignal = signal<Doc[]>([]);
  private readonly currentDocIdSignal = signal<number | null>(null);

  readonly docs = this.docsSignal.asReadonly();
  readonly currentDoc = computed(
    () => this.docsSignal().find((d) => d.id === this.currentDocIdSignal()) ?? null,
  );
  readonly currentVersion = computed(() => {
    const doc = this.currentDoc();
    return doc?.versions.find((v) => v.id === doc.activeVersionId) ?? null;
  });

  setCurrentDoc(documentId: number): void {
    this.currentDocIdSignal.set(documentId);
  }

  clearCurrentDoc(): void {
    this.currentDocIdSignal.set(null);
  }

  /** Real call — GET /api/v1/documents. Scoped server-side to the caller's group/user. */
  async listDocuments(): Promise<DocumentListItem[]> {
    return (await this.http.get<DocumentListItem[]>(DOCUMENTS_BASE).toPromise()) as DocumentListItem[];
  }

  /** Resume a previously uploaded document surfaced via listDocuments(). No fetch needed — the
   *  list item already carries everything the workspace UI needs to make it the active doc. */
  selectExistingDocument(item: DocumentListItem): void {
    const version: DocVersion = {
      id: nextVersionId++,
      label: item.latestVersionLabel,
      createdAt: item.updatedAt,
    };
    const doc: Doc = {
      id: item.id,
      title: item.title,
      status: item.status,
      versions: [version],
      activeVersionId: version.id,
    };
    this.docsSignal.update((docs) => [...docs.filter((d) => d.id !== doc.id), doc]);
    this.currentDocIdSignal.set(doc.id);
  }

  /** Real call — POST /api/v1/documents/upload. Seeds a version entry from the response. */
  async uploadNewDocument(file: File, title: string): Promise<Doc> {
    const formData = new FormData();
    formData.append('file', file);
    const res = (await this.http
      .post<DocumentUploadResponse>(`${DOCUMENTS_BASE}/upload`, formData)
      .toPromise()) as DocumentUploadResponse;

    const version: DocVersion = {
      id: nextVersionId++,
      label: 'v1',
      createdAt: new Date().toISOString(),
    };
    const doc: Doc = {
      id: res.documentId,
      title,
      status: 'READY',
      versions: [version],
      activeVersionId: version.id,
    };
    this.docsSignal.update((docs) => [...docs, doc]);
    this.currentDocIdSignal.set(doc.id);
    return doc;
  }

  /** Real call — POST /api/v1/documents/{documentId}/versions. Appends a version entry. */
  async addVersion(documentId: number, file: File): Promise<Doc> {
    await this.http
      .post<DocumentUploadResponse>(`${DOCUMENTS_BASE}/${documentId}/versions`, (() => {
        const fd = new FormData();
        fd.append('file', file);
        return fd;
      })())
      .toPromise();

    let updatedDoc: Doc | undefined;
    this.docsSignal.update((docs) =>
      docs.map((doc) => {
        if (doc.id !== documentId) return doc;
        const version: DocVersion = {
          id: nextVersionId++,
          label: `v${doc.versions.length + 1}`,
          createdAt: new Date().toISOString(),
        };
        updatedDoc = { ...doc, versions: [...doc.versions, version], activeVersionId: version.id };
        return updatedDoc;
      }),
    );
    return updatedDoc as Doc;
  }

  /**
   * Mock only — there is no GET endpoint to fetch/switch versions, so this just repoints the
   * "active" pointer client-side. A real backend-side revert exists (POST
   * /documents/{id}/versions/{targetVersionId}/revert) but it operates on real version IDs that
   * the backend never returns to us, so it can't be wired against these client-generated IDs.
   */
  switchVersion(documentId: number, versionId: number): void {
    this.docsSignal.update((docs) =>
      docs.map((doc) => (doc.id === documentId ? { ...doc, activeVersionId: versionId } : doc)),
    );
  }

  /** Mock only — no delete endpoint exists backend-side. */
  deleteVersion(documentId: number, versionId: number): void {
    this.docsSignal.update((docs) =>
      docs.map((doc) => {
        if (doc.id !== documentId) return doc;
        const versions = doc.versions.filter((v) => v.id !== versionId);
        const activeVersionId =
          doc.activeVersionId === versionId
            ? (versions[versions.length - 1]?.id ?? 0)
            : doc.activeVersionId;
        return { ...doc, versions, activeVersionId };
      }),
    );
  }
}
