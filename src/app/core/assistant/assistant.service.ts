import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AssistantRequest, AssistantResponse } from '../../models/types';

const ASSISTANT_BASE = `${environment.apiBaseUrl}/api/v1/assistant`;

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly http = inject(HttpClient);

  async ask(message: string, conversationId?: number, documentId?: number): Promise<AssistantResponse> {
    const req: AssistantRequest = { message, conversationId, documentId };
    return this.http
      .post<AssistantResponse>(`${ASSISTANT_BASE}/ask`, req)
      .toPromise() as Promise<AssistantResponse>;
  }
}
