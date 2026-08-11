import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/documents/document.service';
import { ToastService } from '../../shared/toast/toast.service';
import { DocumentHeaderComponent } from './components/document-header/document-header.component';
import { VersionSidebarComponent } from './components/version-sidebar/version-sidebar.component';
import { ChatPanelComponent, ChatVariant } from './components/chat-panel/chat-panel.component';
import { FlowInfoPanelComponent } from './components/flow-info-panel/flow-info-panel.component';
import { UploadDialogComponent, UploadSubmitEvent } from './components/upload-dialog/upload-dialog.component';
import { DocVersion } from '../../core/documents/document.models';
import { DocumentListItem } from '../../models/types';

interface TabDef {
  id: ChatVariant;
  label: string;
  icon: string;
  badge: string;
}

const TABS: TabDef[] = [
  { id: 'qa', label: 'Simple Chat', icon: '💬', badge: 'one-shot' },
  { id: 'assistant', label: 'Memory Chat', icon: '🧠', badge: 'history' },
  { id: 'claims', label: 'Claims Workflow', icon: '🔧', badge: 'single-shot' },
];

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule,
    DocumentHeaderComponent,
    VersionSidebarComponent,
    ChatPanelComponent,
    FlowInfoPanelComponent,
    UploadDialogComponent,
  ],
  template: `
    <div class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
      <app-document-header
        [doc]="documentService.currentDoc()"
        (backClicked)="backToDocuments()"
        (uploadClicked)="openUploadDialog()"
        (versionsClicked)="versionSidebarOpen.set(true)"
        (downloadClicked)="onDownload()"
        (versionSelected)="onVersionSelected($event)"
      />

      @if (documentService.currentDoc()) {
        <div class="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-9">
          <div class="flex gap-1">
            @for (tab of tabs; track tab.id) {
              <button
                type="button"
                class="inline-flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-medium transition-colors"
                [class]="
                  activeTab() === tab.id
                    ? 'border-blue-600 bg-white text-blue-700'
                    : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                "
                (click)="activeTab.set(tab.id)"
              >
                {{ tab.icon }} {{ tab.label }}
                <span
                  class="rounded px-1.5 py-0.5 text-[11px] font-semibold"
                  [class]="activeTab() === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'"
                  >{{ tab.badge }}</span
                >
              </button>
            }
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
            (click)="flowInfoOpen.set(true)"
          >
            ℹ️ How it works
          </button>
        </div>

        <div class="flex min-h-0 flex-1 flex-col bg-white">
          @for (tab of tabs; track tab.id) {
            <div [class.hidden]="activeTab() !== tab.id" class="flex h-full min-h-0 flex-col">
              <app-chat-panel [variant]="tab.id" [documentId]="documentService.currentDoc()?.id ?? null" />
            </div>
          }
        </div>
      } @else {
        <div class="min-h-0 flex-1 overflow-y-auto bg-white px-10 py-10">
          <div class="mx-auto max-w-5xl">
            @if (loadingList()) {
              <p class="text-sm text-slate-400">Loading your documents…</p>
            } @else {
              <div class="mb-5 flex items-center justify-between">
                <h2 class="text-base font-semibold text-slate-800">Resume a document</h2>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  [disabled]="refreshingList()"
                  (click)="refreshDocuments()"
                  title="Ingestion runs asynchronously — refresh to pick up status changes"
                >
                  🔄 {{ refreshingList() ? 'Refreshing…' : 'Refresh' }}
                </button>
              </div>
            }
            @if (!loadingList() && documentList().length > 0) {
              <div class="flex flex-col gap-2.5">
                @for (item of documentList(); track item.id) {
                  <button
                    type="button"
                    class="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white px-5 py-4 text-left transition-colors"
                    [class]="
                      item.status === 'READY'
                        ? 'hover:border-orange-300 hover:bg-orange-50/30'
                        : 'cursor-not-allowed opacity-60'
                    "
                    [disabled]="item.status !== 'READY'"
                    (click)="selectExistingDocument(item)"
                  >
                    <div class="flex flex-col gap-1">
                      <span class="text-sm font-medium text-slate-900">📄 {{ item.title }}</span>
                      <span class="text-xs text-slate-500">
                        {{ item.latestVersionLabel }} · updated {{ item.updatedAt | date: 'MMM d, y, h:mm a' }}
                      </span>
                    </div>
                    <span
                      class="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[12px] font-medium"
                      [class]="statusClasses(item.status)"
                    >
                      ● {{ item.status }}
                    </span>
                  </button>
                }
              </div>
              <button
                type="button"
                class="mt-6 inline-flex w-fit items-center gap-1.5 rounded-md bg-orange-500 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-orange-600"
                (click)="openUploadDialog()"
              >
                ⬆ Upload a new document
              </button>
            } @else {
              <p class="text-sm text-slate-400">No documents yet — upload one to get started.</p>
            }
          </div>
        </div>
      }
    </div>

    <app-version-sidebar
      [open]="versionSidebarOpen()"
      [doc]="documentService.currentDoc()"
      (closeClicked)="versionSidebarOpen.set(false)"
      (switchClicked)="onVersionSelected($event)"
    />

    <app-flow-info-panel
      [open]="flowInfoOpen()"
      [variant]="activeTab()"
      (closeClicked)="flowInfoOpen.set(false)"
    />

    <app-upload-dialog
      [open]="uploadDialogOpen()"
      [isNewDocument]="!documentService.currentDoc()"
      (cancelClicked)="uploadDialogOpen.set(false)"
      (submitted)="onUploadSubmit($event)"
    />
  `,
})
export class WorkspaceComponent implements OnInit {
  protected readonly documentService = inject(DocumentService);
  private readonly toastService = inject(ToastService);

  protected readonly tabs = TABS;
  protected readonly activeTab = signal<ChatVariant>('qa');
  protected readonly versionSidebarOpen = signal(false);
  protected readonly flowInfoOpen = signal(false);
  protected readonly uploadDialogOpen = signal(false);
  protected readonly documentList = signal<DocumentListItem[]>([]);
  protected readonly loadingList = signal(false);
  protected readonly refreshingList = signal(false);

  async ngOnInit(): Promise<void> {
    this.loadingList.set(true);
    try {
      const list = await this.documentService.listDocuments();
      this.documentList.set(list);
    } catch {
      // errorInterceptor already surfaces a toast
    } finally {
      this.loadingList.set(false);
    }
  }

  async refreshDocuments(): Promise<void> {
    this.refreshingList.set(true);
    try {
      const list = await this.documentService.listDocuments();
      this.documentList.set(list);
    } catch {
      // errorInterceptor already surfaces a toast
    } finally {
      this.refreshingList.set(false);
    }
  }

  selectExistingDocument(item: DocumentListItem): void {
    if (item.status !== 'READY') return;
    this.documentService.selectExistingDocument(item);
  }

  async backToDocuments(): Promise<void> {
    this.documentService.clearCurrentDoc();
    this.activeTab.set('qa');
    try {
      this.documentList.set(await this.documentService.listDocuments());
    } catch {
      // errorInterceptor already surfaces a toast
    }
  }

  statusClasses(status: DocumentListItem['status']): string {
    switch (status) {
      case 'READY':
        return 'bg-green-50 text-green-700';
      case 'PENDING':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-red-50 text-red-700';
    }
  }

  openUploadDialog(): void {
    this.uploadDialogOpen.set(true);
  }

  async onUploadSubmit(event: UploadSubmitEvent): Promise<void> {
    const currentDoc = this.documentService.currentDoc();
    try {
      if (currentDoc) {
        await this.documentService.addVersion(currentDoc.id, event.file);
        this.toastService.success('New version uploaded.');
      } else {
        await this.documentService.uploadNewDocument(event.file, event.title);
        this.toastService.success('Document uploaded.');
      }
      this.uploadDialogOpen.set(false);
    } catch {
      // errorInterceptor already surfaces a toast
    }
  }

  onVersionSelected(version: DocVersion): void {
    const doc = this.documentService.currentDoc();
    if (!doc) return;
    this.documentService.switchVersion(doc.id, version.id);
    this.versionSidebarOpen.set(false);
  }

  onDownload(): void {
    this.toastService.error('Download isn\'t wired to a backend endpoint yet.');
  }
}
