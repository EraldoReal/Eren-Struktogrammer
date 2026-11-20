import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  CornerDownLeft,
  HelpCircle,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { OPERATOR_CATEGORIES, OPERATORS_LIST } from '../data/operators';
import { generateId } from '../model/defaults';
import type { CustomOperatorEntry } from '../model/types';
import { useEditorStore } from '../store/editorStore';

export interface OperatorsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type OperatorFilter = 'all' | 'standard' | 'custom';

export const OperatorsSidebar: React.FC<OperatorsSidebarProps> = ({ isOpen, onClose }) => {
  const [width, setWidth] = useState(300);
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<OperatorFilter>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSyntax, setNewSyntax] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const language = useEditorStore((s) => s.appSettings.language);
  const customOperators = useEditorStore((s) => s.appSettings.customOperators ?? []);
  const updateAppSettings = useEditorStore((s) => s.updateAppSettings);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const updateNodeText = useEditorStore((s) => s.updateNodeText);

  const isDe = language === 'de';

  const filteredStandard = useMemo(() => {
    if (filterMode === 'custom') return [];
    const q = query.trim().toLowerCase();
    if (!q) return OPERATORS_LIST;
    return OPERATORS_LIST.filter(
      (op) =>
        op.title.toLowerCase().includes(q) ||
        op.syntax.toLowerCase().includes(q) ||
        op.example.toLowerCase().includes(q) ||
        op.description.toLowerCase().includes(q)
    );
  }, [query, filterMode]);

  const filteredCustom = useMemo(() => {
    if (filterMode === 'standard') return [];
    const q = query.trim().toLowerCase();
    if (!q) return customOperators;
    return customOperators.filter(
      (op) =>
        op.title.toLowerCase().includes(q) ||
        op.syntax.toLowerCase().includes(q) ||
        (op.description ?? '').toLowerCase().includes(q)
    );
  }, [query, filterMode, customOperators]);

  if (!isOpen) return null;

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const startX = e.clientX;
    const origWidth = width;

    const onMove = (ev: MouseEvent) => {
      const dx = startX - ev.clientX;
      setWidth(Math.max(240, Math.min(620, origWidth + dx)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1300);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleInsertIntoSelected = (text: string) => {
    if (!selectedDiagramId || !selectedNodeId) return;
    updateNodeText(selectedDiagramId, selectedNodeId, text);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    const syntax = newSyntax.trim();
    const description = newDesc.trim();
    if (!title || !syntax) return;

    const nextEntry: CustomOperatorEntry = {
      id: generateId(),
      title,
      syntax,
      ...(description ? { description } : {}),
    };
    updateAppSettings({
      customOperators: [nextEntry, ...customOperators],
    });
    setNewTitle('');
    setNewSyntax('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleDeleteCustom = (id: string) => {
    updateAppSettings({
      customOperators: customOperators.filter((op) => op.id !== id),
    });
  };

  const canInsert = Boolean(selectedDiagramId && selectedNodeId);

  return (
    <aside
      style={{ width }}
      className="no-print relative shrink-0 h-full flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-text z-30"
    >
      {/* Left resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        title={isDe ? 'Breite anpassen' : 'Resize width'}
        className="absolute left-0 top-0 bottom-0 w-1.5 -translate-x-0.5 cursor-ew-resize hover:bg-blue-500/50 active:bg-blue-500 transition-colors z-40"
      />

      {/* Compact Header */}
      <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
            {isDe ? 'Operatoren (BW v2.2)' : 'Operators (BW v2.2)'}
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsAdding((v) => !v)}
            title={isDe ? 'Eigenen Operator hinzufügen' : 'Add custom operator'}
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              isAdding
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>{isDe ? 'Neu' : 'New'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title={isDe ? 'Schließen' : 'Close'}
            className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Custom Operator Form */}
      {isAdding && (
        <form
          onSubmit={handleAddCustom}
          className="p-2 border-b border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-slate-950/60 space-y-1.5"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={isDe ? 'Titel (z. B. Modulo)' : 'Title (e.g. Modulo)'}
            required
            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newSyntax}
            onChange={(e) => setNewSyntax(e.target.value)}
            placeholder={isDe ? 'Befehl (z. B. rest = a MOD b)' : 'Command (e.g. rest = a MOD b)'}
            required
            className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder={isDe ? 'Notiz / Erklärung (optional)' : 'Note / description (optional)'}
            className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-[11px] rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isDe ? 'Abbrechen' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              {isDe ? 'Speichern' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* Search + Filter Pills */}
      <div className="px-2 py-1.5 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
        <div className="relative">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isDe ? 'Suchen…' : 'Search…'}
            className="w-full pl-6 pr-6 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] font-medium">
          {(
            [
              { id: 'all', label: isDe ? 'Alle' : 'All' },
              { id: 'standard', label: isDe ? 'Standard (BW)' : 'Standard' },
              { id: 'custom', label: `${isDe ? 'Eigene' : 'Custom'} (${customOperators.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operator List */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-2.5">
        {/* Custom Operators Section */}
        {filteredCustom.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-0.5">
              {isDe ? 'Eigene Operatoren' : 'Custom Operators'}
            </h3>
            {filteredCustom.map((op) => {
              const key = `custom-${op.id}`;
              const infoOpen = openInfoId === key;
              return (
                <div
                  key={op.id}
                  className="rounded border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 px-2 py-1 space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-100 truncate">
                      {op.title}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {op.description && (
                        <button
                          type="button"
                          onClick={() => setOpenInfoId(infoOpen ? null : key)}
                          title={isDe ? 'Erklärung anzeigen' : 'Show note'}
                          className={`p-0.5 rounded transition-colors cursor-pointer ${
                            infoOpen
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(op.id)}
                        title={isDe ? 'Löschen' : 'Delete'}
                        className="p-0.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5">
                    <code
                      onClick={() => handleCopy(key, op.syntax)}
                      title={isDe ? 'Klicken zum Kopieren' : 'Click to copy'}
                      className="flex-1 text-[11px] font-mono text-slate-800 dark:text-slate-100 truncate cursor-pointer"
                    >
                      {op.syntax}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(key, op.syntax)}
                      title={isDe ? 'In Zwischenablage kopieren' : 'Copy'}
                      className="p-0.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedKey === key ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {canInsert && (
                      <button
                        type="button"
                        onClick={() => handleInsertIntoSelected(op.syntax)}
                        title={isDe ? 'In ausgewähltes Element einfügen' : 'Insert into selected node'}
                        className="p-0.5 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                      >
                        <CornerDownLeft className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {infoOpen && op.description && (
                    <p className="pt-0.5 text-[10px] text-slate-600 dark:text-slate-300 border-t border-blue-200/60 dark:border-blue-900/40">
                      {op.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filterMode === 'custom' && filteredCustom.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
            <p>
              {isDe
                ? 'Noch keine eigenen Operatoren angelegt.'
                : 'No custom operators created yet.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-2.5 py-1 rounded bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700 cursor-pointer"
            >
              + {isDe ? 'Ersten Operator anlegen' : 'Create first operator'}
            </button>
          </div>
        )}

        {/* Standard Categories */}
        {OPERATOR_CATEGORIES.map((cat) => {
          const items = filteredStandard.filter((op) => op.category === cat.id);
          if (items.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-0.5">
                {cat.label}
              </h3>

              {items.map((op) => {
                const syntaxKey = `${op.id}-syntax`;
                const infoOpen = openInfoId === op.id;

                return (
                  <div
                    key={op.id}
                    className="rounded border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 px-2 py-1 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                        {op.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenInfoId(infoOpen ? null : op.id)}
                        title={isDe ? 'Erklärung & Beispiel anzeigen' : 'Show description & example'}
                        className={`p-0.5 rounded transition-colors cursor-pointer shrink-0 ${
                          infoOpen
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 py-0.5">
                      <code
                        onClick={() => handleCopy(syntaxKey, op.syntax)}
                        title={isDe ? 'Klicken zum Kopieren' : 'Click to copy'}
                        className="flex-1 text-[11px] font-mono text-slate-800 dark:text-slate-100 truncate cursor-pointer"
                      >
                        {op.syntax}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(syntaxKey, op.syntax)}
                        title={isDe ? 'In Zwischenablage kopieren' : 'Copy'}
                        className="p-0.5 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedKey === syntaxKey ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {canInsert && (
                        <button
                          type="button"
                          onClick={() => handleInsertIntoSelected(op.syntax)}
                          title={isDe ? 'Direkt in ausgewähltes Element einfügen' : 'Insert into selected node'}
                          className="p-0.5 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                        >
                          <CornerDownLeft className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {infoOpen && (
                      <div className="pt-0.5 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5 border-t border-slate-200/70 dark:border-slate-800/70">
                        <p className="leading-snug">{op.description}</p>
                        <p className="font-mono text-slate-500 dark:text-slate-400 break-all">
                          Bsp: {op.example}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
