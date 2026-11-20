import React from 'react';

export const MATH_SYMBOLS = ['←', '≤', '≥', '≠', '∧', '∨', '¬', '·', '÷', '∞'] as const;

export interface SymbolPickerProps {
  onInsert?: (symbol: string) => void;
  targetRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

function insertIntoActiveElement(
  el: HTMLInputElement | HTMLTextAreaElement,
  symbol: string,
): void {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const nextValue = el.value.slice(0, start) + symbol + el.value.slice(end);

  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  if (descriptor?.set) {
    descriptor.set.call(el, nextValue);
  } else {
    el.value = nextValue;
  }

  const nextCursor = start + symbol.length;
  el.setSelectionRange(nextCursor, nextCursor);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export const SymbolPicker: React.FC<SymbolPickerProps> = ({
  onInsert,
  targetRef,
  className = '',
  style,
}) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>, symbol: string) => {
    // Prevent stealing focus from the active input/textarea
    e.preventDefault();
    e.stopPropagation();

    if (onInsert) {
      onInsert(symbol);
      return;
    }

    const active = document.activeElement;
    const target =
      targetRef?.current ??
      (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
        ? active
        : null);

    if (target) {
      insertIntoActiveElement(target, symbol);
    }
  };

  return (
    <div
      role="toolbar"
      aria-label="Math & Logic Symbols"
      style={style}
      onMouseDown={(e) => {
        // Keep focus in the active editor even if clicking padding between buttons
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`inline-flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-1.5 py-1 shadow-lg select-none ${className}`}
    >
      {MATH_SYMBOLS.map((sym) => (
        <button
          key={sym}
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => handleMouseDown(e, sym)}
          title={sym}
          className="min-w-[24px] h-6 px-1.5 rounded text-xs font-mono font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 active:scale-95 transition-colors flex items-center justify-center cursor-pointer"
        >
          {sym}
        </button>
      ))}
    </div>
  );
};
