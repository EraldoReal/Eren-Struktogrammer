import type { AppSettings } from '../model/types.ts';
import type {
  FileDialogFilter,
  OpenDialogOptions,
  OpenedFile,
  PlatformAdapter,
  SaveDialogOptions,
} from './adapter.ts';

const SETTINGS_STORAGE_KEY = 'hus-struktogrammer:settings';
const RECENT_CACHE_KEY = 'hus-struktogrammer:recent-cache';
const MAX_CACHED_FILE_BYTES = 256 * 1024;
const MAX_CACHED_ENTRIES = 10;

function isDiagramOrProjectFile(name: string): boolean {
  return /\.(stgp|stpr|stgr|nsd|json)$/i.test(name);
}

function readRecentCache(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(RECENT_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function cacheRecentFile(name: string, content: string): void {
  if (typeof localStorage === 'undefined') return;
  if (!isDiagramOrProjectFile(name) || content.length > MAX_CACHED_FILE_BYTES) return;
  try {
    const cache = readRecentCache();
    delete cache[name];
    const entries = Object.entries(cache);
    entries.unshift([name, content]);
    const trimmed = Object.fromEntries(entries.slice(0, MAX_CACHED_ENTRIES));
    localStorage.setItem(RECENT_CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota errors
  }
}

interface FileSystemWritableFileStreamLike {
  write(data: string | BufferSource | Blob): Promise<void>;
  close(): Promise<void>;
}

interface FileSystemFileHandleLike {
  name: string;
  getFile(): Promise<File>;
  isSameEntry?(other: FileSystemFileHandleLike): Promise<boolean>;
  createWritable(): Promise<FileSystemWritableFileStreamLike>;
}

interface FilePickerAcceptTypeLike {
  description?: string;
  accept: Record<string, string[]>;
}

interface WindowWithFileSystemAccess extends Window {
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: FilePickerAcceptTypeLike[];
  }) => Promise<FileSystemFileHandleLike[]>;
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    excludeAcceptAllOption?: boolean;
    types?: FilePickerAcceptTypeLike[];
  }) => Promise<FileSystemFileHandleLike>;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function toAcceptTypes(
  filters?: FileDialogFilter[],
  fallbackMime = 'application/octet-stream',
): FilePickerAcceptTypeLike[] | undefined {
  if (!filters || filters.length === 0) {
    return undefined;
  }

  return filters.map((filter) => ({
    description: filter.name,
    accept: {
      [fallbackMime]: filter.extensions.map((ext) =>
        ext.startsWith('.') ? ext : `.${ext}`,
      ),
    },
  }));
}

function toInputAccept(filters?: FileDialogFilter[]): string | undefined {
  if (!filters || filters.length === 0) {
    return undefined;
  }

  const extensions = filters.flatMap((filter) =>
    filter.extensions.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`)),
  );
  return extensions.length > 0 ? extensions.join(',') : undefined;
}

function decodeText(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

async function readBrowserFile(file: File): Promise<OpenedFile> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return {
    name: file.name,
    content: decodeText(bytes),
    bytes,
  };
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openFileViaInput(filters?: FileDialogFilter[]): Promise<OpenedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    const accept = toInputAccept(filters);
    if (accept) {
      input.accept = accept;
    }

    let settled = false;
    const cleanup = () => {
      window.removeEventListener('focus', onFocus);
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    const finish = (result: OpenedFile | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      try {
        finish(await readBrowserFile(file));
      } catch {
        finish(null);
      }
    });

    input.addEventListener('cancel', () => {
      finish(null);
    });

    // Browsers without the 'cancel' event: when the window regains focus and no file
    // was chosen shortly after, treat the dialog as dismissed so the promise settles.
    function onFocus() {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!settled && !(input.files && input.files.length > 0)) {
          finish(null);
        }
      }, 1000);
    }
    window.addEventListener('focus', onFocus);

    document.body.appendChild(input);
    input.click();
  });
}

export class WebPlatformAdapter implements PlatformAdapter {
  readonly isDesktop = false;
  private readonly fileHandles = new Map<string, FileSystemFileHandleLike>();

  /**
   * Registers a handle under a unique key. Browsers only expose the bare file name,
   * so two different files called "plan.stgr" would otherwise overwrite each other's handle.
   * A colliding name gets a " (n)" suffix before the extension.
   */
  private async registerHandle(handle: FileSystemFileHandleLike): Promise<string> {
    const dot = handle.name.lastIndexOf('.');
    const stem = dot > 0 ? handle.name.slice(0, dot) : handle.name;
    const ext = dot > 0 ? handle.name.slice(dot) : '';
    for (let n = 1; n < 1000; n++) {
      const key = n === 1 ? handle.name : `${stem} (${n})${ext}`;
      const existing = this.fileHandles.get(key);
      if (!existing) {
        this.fileHandles.set(key, handle);
        return key;
      }
      try {
        if (existing === handle || (await existing.isSameEntry?.(handle))) {
          this.fileHandles.set(key, handle);
          return key;
        }
      } catch {
        // treat as different entry
      }
    }
    this.fileHandles.set(handle.name, handle);
    return handle.name;
  }

  async openFileDialog(options?: OpenDialogOptions): Promise<OpenedFile | null> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return null;
    }

    const win = window as WindowWithFileSystemAccess;
    if (typeof win.showOpenFilePicker === 'function') {
      try {
        const handles = await win.showOpenFilePicker({
          multiple: false,
          types: toAcceptTypes(options?.filters, 'application/json'),
        });
        const handle = handles[0];
        if (!handle) {
          return null;
        }
        const file = await handle.getFile();
        const opened = await readBrowserFile(file);
        const key = await this.registerHandle(handle);
        cacheRecentFile(key, opened.content);
        return {
          ...opened,
          path: key,
        };
      } catch (error) {
        if (isAbortError(error)) {
          return null;
        }
        // Fall back to <input type="file"> if File System Access API is blocked/unavailable
      }
    }

    const fallbackOpened = await openFileViaInput(options?.filters);
    if (fallbackOpened) {
      cacheRecentFile(fallbackOpened.name, fallbackOpened.content);
    }
    return fallbackOpened;
  }

  async saveFileDialog(
    content: string,
    options?: SaveDialogOptions,
  ): Promise<string | null> {
    const filename = options?.defaultName ?? options?.defaultPath ?? 'diagram.stgr';
    const mimeType = options?.mimeType ?? 'application/json;charset=utf-8';

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return null;
    }

    const win = window as WindowWithFileSystemAccess;
    if (typeof win.showSaveFilePicker === 'function') {
      try {
        const handle = await win.showSaveFilePicker({
          suggestedName: filename,
          types: toAcceptTypes(options?.filters, mimeType.split(';')[0]),
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        const key = await this.registerHandle(handle);
        cacheRecentFile(key, content);
        return key;
      } catch (error) {
        if (isAbortError(error)) {
          return null;
        }
        // Fall back to Blob download
      }
    }

    const blob = new Blob([content], { type: mimeType });
    triggerBlobDownload(blob, filename);
    cacheRecentFile(filename, content);
    return filename;
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    const handle = this.fileHandles.get(path);
    if (!handle) {
      throw new Error('No writable browser file handle for this path');
    }
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    cacheRecentFile(path, content);
  }

  async readFileByPath(path: string): Promise<OpenedFile | null> {
    const cache = readRecentCache();
    const content = cache[path];
    if (typeof content !== 'string') {
      return null;
    }
    return {
      name: path,
      path,
      content,
      bytes: new TextEncoder().encode(content),
    };
  }

  clearRecentCache(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(RECENT_CACHE_KEY);
    } catch {
      // ignore
    }
  }

  async exportBinaryFile(
    data: Uint8Array,
    options?: SaveDialogOptions,
  ): Promise<string | null> {
    const filename = options?.defaultName ?? options?.defaultPath ?? 'export.png';
    const mimeType = options?.mimeType ?? 'application/octet-stream';
    const safeBytes = new Uint8Array(data);

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return null;
    }

    const win = window as WindowWithFileSystemAccess;
    if (typeof win.showSaveFilePicker === 'function') {
      try {
        const handle = await win.showSaveFilePicker({
          suggestedName: filename,
          types: toAcceptTypes(options?.filters, mimeType.split(';')[0]),
        });
        const writable = await handle.createWritable();
        await writable.write(safeBytes);
        await writable.close();
        return handle.name;
      } catch (error) {
        if (isAbortError(error)) {
          return null;
        }
        // Fall back to Blob download
      }
    }

    const blob = new Blob([safeBytes], { type: mimeType });
    triggerBlobDownload(blob, filename);
    return filename;
  }

  async printPage(): Promise<void> {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }

  async loadSettings(): Promise<AppSettings | null> {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as AppSettings;
    } catch {
      return null;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
}
