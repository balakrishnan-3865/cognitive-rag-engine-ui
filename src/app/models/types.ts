export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface UserSummaryResponse {
  id: number;
  groupId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  enabled: boolean;
}

// ---- Phase 2: Documents ----

export interface DocumentUploadResponse {
  documentId: number;
}

export type DocumentIngestionStatus = 'PENDING' | 'READY' | 'FAILED' | 'NO_CHUNKS_FOUND';

export interface DocumentListItem {
  id: number;
  title: string;
  latestVersionLabel: string;
  status: DocumentIngestionStatus;
  updatedAt: string;
}

// ---- Phase 3: QA (single-turn) ----

export interface QARequest {
  query: string;
  documentId?: number;
}

export interface SourceChunk {
  text: string;
  chunkId: number;
  documentId: number;
  chunkNumber: number;
  similarity: number;
  source: string;
}

export interface QAResponse {
  answered: boolean;
  reasonMessage: string;
  sources: SourceChunk[];
  answer: string;
}

// ---- Phase 4: Assistant (conversational) ----

export interface AssistantRequest {
  message: string;
  conversationId?: number;
  documentId?: number;
}

export interface AssistantResponse {
  answered: boolean;
  reasonMessage: string;
  sources: SourceChunk[];
  answer: string;
  conversationId: number;
}

// ---- Phase 5: Claims workflow query ----

export interface AssistantQueryRequest {
  query: string;
  documentId?: number;
}

export interface AssistantQueryResponse {
  answered: boolean;
  reasonMessage: string;
  sources: SourceChunk[];
  answer: string;
}
