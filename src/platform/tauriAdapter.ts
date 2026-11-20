import { open, save } from '@tauri-apps/plugin-dialog';
import {
  BaseDirectory,
  exists,
  mkdir,
  readFile,
  readTextFile,
  writeFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import type { AppSettings } from '../model/types.ts';
import type {
  OpenDialogOptions,
  OpenedFile,
  PlatformAdapter,
  SaveDialogOptions,
} from './adapter.ts';

const SETTINGS_FILENAME = 'settings.json';

function extractFileName(filePath: string): string {
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1] || filePath;
}

export class TauriPlatformAdapter implements PlatformAdapter {
  readonly isDesktop = true;

  async openFileDialog(options?: OpenDialogOptions): Promise<OpenedFile | null> {
    const selected = await open({
      multiple: false,
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    });

    if (!selected || typeof selected !== 'string') {
      return null;
    }

    const bytes = await readFile(selected);
    const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    return {
      name: extractFileName(selected),
      path: selected,
      content,
      bytes,
    };
  }

  async saveFileDialog(
    content: string,
    options?: SaveDialogOptions,
  ): Promise<string | null> {
    const targetPath = await save({
      title: options?.title,
      defaultPath: options?.defaultPath ?? options?.defaultName,
      filters: options?.filters,
    });

    if (!targetPath) {
      return null;
    }

    await writeTextFile(targetPath, content);
    return targetPath;
  }

  async writeTextFile(path: string, content: string): Promise<void> {
    await writeTextFile(path, content);
  }

  async readFileByPath(path: string): Promise<OpenedFile | null> {
    const fileExists = await exists(path);
    if (!fileExists) {
      return null;
    }
    const bytes = await readFile(path);
    const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return {
      name: extractFileName(path),
      path,
      content,
      bytes,
    };
  }

  async exportBinaryFile(
    data: Uint8Array,
    options?: SaveDialogOptions,
  ): Promise<string | null> {
    const targetPath = await save({
      title: options?.title,
      defaultPath: options?.defaultPath ?? options?.defaultName,
      filters: options?.filters,
    });

    if (!targetPath) {
      return null;
    }

    await writeFile(targetPath, data);
    return targetPath;
  }

  async printPage(): Promise<void> {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }

  async loadSettings(): Promise<AppSettings | null> {
    try {
      const hasSettings = await exists(SETTINGS_FILENAME, {
        baseDir: BaseDirectory.AppConfig,
      });
      if (!hasSettings) {
        return null;
      }
      const raw = await readTextFile(SETTINGS_FILENAME, {
        baseDir: BaseDirectory.AppConfig,
      });
      return JSON.parse(raw) as AppSettings;
    } catch {
      return null;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await mkdir('', {
      baseDir: BaseDirectory.AppConfig,
      recursive: true,
    });
    await writeTextFile(SETTINGS_FILENAME, JSON.stringify(settings, null, 2), {
      baseDir: BaseDirectory.AppConfig,
    });
  }
}
