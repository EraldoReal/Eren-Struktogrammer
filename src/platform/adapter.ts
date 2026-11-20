import type { AppSettings } from '../model/types.ts';
import { WebPlatformAdapter } from './webAdapter.ts';
import { TauriPlatformAdapter } from './tauriAdapter.ts';

export interface FileDialogFilter {
  name: string;
  extensions: string[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileDialogFilter[];
}

export interface SaveDialogOptions {
  title?: string;
  defaultName?: string;
  defaultPath?: string;
  filters?: FileDialogFilter[];
  mimeType?: string;
}

export interface OpenedFile {
  name: string;
  path?: string;
  content: string;
  bytes: Uint8Array;
}

export interface PlatformAdapter {
  readonly isDesktop: boolean;
  openFileDialog(options?: OpenDialogOptions): Promise<OpenedFile | null>;
  saveFileDialog(content: string, options?: SaveDialogOptions): Promise<string | null>;
  writeTextFile?(path: string, content: string): Promise<void>;
  readFileByPath?(path: string): Promise<OpenedFile | null>;
  clearRecentCache?(): void;
  exportBinaryFile(data: Uint8Array, options?: SaveDialogOptions): Promise<string | null>;
  printPage(): Promise<void>;
  loadSettings(): Promise<AppSettings | null>;
  saveSettings(settings: AppSettings): Promise<void>;
}

let cachedAdapter: PlatformAdapter | null = null;

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function getPlatformAdapter(): PlatformAdapter {
  if (cachedAdapter) {
    return cachedAdapter;
  }

  cachedAdapter = isTauriEnvironment()
    ? new TauriPlatformAdapter()
    : new WebPlatformAdapter();

  return cachedAdapter;
}
