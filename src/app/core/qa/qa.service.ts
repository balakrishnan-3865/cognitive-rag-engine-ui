import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { QARequest, QAResponse } from '../../models/types';

const QA_BASE = `${environment.apiBaseUrl}/api/v1/qa`;

@Injectable({ providedIn: 'root' })
export class QaService {
  private readonly http = inject(HttpClient);

  async ask(query: string, documentId?: number): Promise<QAResponse> {
    const req: QARequest = { query, documentId };
    return this.http.post<QAResponse>(`${QA_BASE}/ask`, req).toPromise() as Promise<QAResponse>;
  }
}
