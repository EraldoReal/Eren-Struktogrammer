import { serializeProject } from '../model/serializer.ts';
import type { ProjectDocument } from '../model/types.ts';

export const SHARE_API_BASE = 'https://strukto.best-tools.app/api/share';
export const SHARE_APP_ORIGIN = 'https://strukto.best-tools.app';

export interface CreatedShareLink {
  id: string;
  code: string;
  url: string;
  expiresAt: string;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function parseShareInput(raw: string): { id: string; key: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let fragment = trimmed;
  const hashIdx = trimmed.indexOf('#');
  if (hashIdx !== -1) {
    fragment = trimmed.slice(hashIdx + 1);
  }
  if (fragment.startsWith('s=')) {
    fragment = fragment.slice(2);
  }

  const dotIdx = fragment.indexOf('.');
  if (dotIdx <= 0 || dotIdx === fragment.length - 1) {
    return null;
  }

  const id = fragment.slice(0, dotIdx).trim().toUpperCase();
  const key = fragment.slice(dotIdx + 1).trim();
  if (!/^[A-Z0-9]{4,16}$/.test(id) || !/^[A-Za-z0-9_-]{16,64}$/.test(key)) {
    return null;
  }
  return { id, key };
}

export async function createShareLink(
  project: ProjectDocument,
  lang: 'de' | 'en' = 'de',
): Promise<CreatedShareLink> {
  const json = serializeProject(project);
  const plainBytes = new TextEncoder().encode(json);

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 128 },
    true,
    ['encrypt', 'decrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plainBytes,
  );
  const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', key));

  const res = await fetch(SHARE_API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app: 'strukto',
      iv: toBase64Url(iv),
      data: toBase64Url(new Uint8Array(cipherBuffer)),
    }),
  });

  if (!res.ok) {
    let errMsg = '';
    try {
      const errBody = (await res.json()) as { error?: string };
      errMsg = errBody.error || '';
    } catch {
      // ignore
    }
    if (res.status === 413) {
      throw new Error(
        lang === 'de'
          ? 'Das Projekt ist zu groß für einen Share-Link (max. 512 KB).'
          : 'The project is too large for a share link (max 512 KB).',
      );
    }
    if (res.status === 429) {
      throw new Error(
        lang === 'de'
          ? 'Zu viele Links erstellt. Bitte warte einen Moment.'
          : 'Too many share links created. Please wait a moment.',
      );
    }
    throw new Error(
      errMsg ||
        (lang === 'de'
          ? `Share-Link konnte nicht erstellt werden (HTTP ${res.status}).`
          : `Could not create share link (HTTP ${res.status}).`),
    );
  }

  const body = (await res.json()) as { id: string; expiresAt: string };
  const keyStr = toBase64Url(rawKey);
  const code = `${body.id}.${keyStr}`;
  const url = `${SHARE_APP_ORIGIN}/#s=${code}`;

  return {
    id: body.id,
    code,
    url,
    expiresAt: body.expiresAt,
  };
}

export async function fetchAndDecryptShare(
  input: string,
  lang: 'de' | 'en' = 'de',
): Promise<string> {
  const parsed = parseShareInput(input);
  if (!parsed) {
    throw new Error(
      lang === 'de'
        ? 'Ungültiger Share-Link oder Code.'
        : 'Invalid share link or code.',
    );
  }

  const res = await fetch(`${SHARE_API_BASE}/${encodeURIComponent(parsed.id)}`);
  if (res.status === 404) {
    throw new Error(
      lang === 'de'
        ? 'Dieser Link wurde nicht gefunden oder ist nach 24 Stunden abgelaufen.'
        : 'This link was not found or has expired after 24 hours.',
    );
  }
  if (!res.ok) {
    throw new Error(
      lang === 'de'
        ? `Link konnte nicht geladen werden (HTTP ${res.status}).`
        : `Could not load share link (HTTP ${res.status}).`,
    );
  }

  const body = (await res.json()) as {
    app: string;
    iv: string;
    data: string;
  };

  if (body.app !== 'strukto') {
    throw new Error(
      lang === 'de'
        ? `Dieser Link gehört zu einer anderen App (${body.app}) und nicht zu Eren Struktogrammer.`
        : `This link belongs to another app (${body.app}), not Eren Struktogrammer.`,
    );
  }

  try {
    const rawKey = fromBase64Url(parsed.key);
    const iv = fromBase64Url(body.iv);
    const cipherBytes = fromBase64Url(body.data);
    const key = await crypto.subtle.importKey(
      'raw',
      rawKey.buffer as ArrayBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      cipherBytes.buffer as ArrayBuffer,
    );
    return new TextDecoder('utf-8').decode(plainBuffer);
  } catch {
    throw new Error(
      lang === 'de'
        ? 'Entschlüsselung fehlgeschlagen. Bitte prüfe, ob der Link vollständig ist.'
        : 'Decryption failed. Please check that the link is complete.',
    );
  }
}
