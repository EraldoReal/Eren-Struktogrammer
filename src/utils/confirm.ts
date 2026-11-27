import { isTauriEnvironment } from '../platform/adapter';

/**
 * Yes/no question that works in the browser and in the desktop app. The Tauri
 * webviews do not reliably support window.confirm, so the native dialog plugin
 * is used there.
 */
export async function confirmAction(message: string, title?: string): Promise<boolean> {
  if (isTauriEnvironment()) {
    try {
      const { confirm } = await import('@tauri-apps/plugin-dialog');
      return await confirm(message, { title, kind: 'warning' });
    } catch {
      // fall through to the browser dialog
    }
  }
  return typeof window !== 'undefined' ? window.confirm(message) : true;
}
