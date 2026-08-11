import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AssistantQueryRequest, AssistantQueryResponse } from '../../models/types';

const CLAIMS_BASE = `${environment.apiBaseUrl}/api/v1/claims`;

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private readonly http = inject(HttpClient);

  async query(query: string, documentId?: number): Promise<AssistantQueryResponse> {
    const req: AssistantQueryRequest = { query, documentId };
    return this.http
      .post<AssistantQueryResponse>(`${CLAIMS_BASE}/query`, req)
      .toPromise() as Promise<AssistantQueryResponse>;
  }
}
