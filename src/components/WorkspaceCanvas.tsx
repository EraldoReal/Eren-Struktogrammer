import React, { useEffect, useRef, useState } from 'react';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
  useEditorStore,
} from '../store/editorStore';
import { DiagramWindow } from './DiagramWindow';

export interface WorkspaceCanvasProps {
  onContextMenuNode: (e: React.MouseEvent, diagramId: string, nodeId: string) => void;
  onContextMenuCanvas: (e: React.MouseEvent) => void;
}

export const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({
  onContextMenuNode,
  onContextMenuCanvas,
}) => {
  const project = useEditorStore(
    (s) => s.projects.find((p) => p.id === s.activeProjectId) ?? s.projects[0],
  );
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const activeInsertTool = useEditorStore((s) => s.activeInsertTool);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setPan = useEditorStore((s) => s.setPan);
  const selectNode = useEditorStore((s) => s.selectNode);
  const setEditingNode = useEditorStore((s) => s.setEditingNode);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  // Track Space key for Space+drag panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      ) {
        return;
      }
      setSpacePressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    const handleBlur = () => setSpacePressed(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Non-passive wheel listener for Ctrl/Meta zoom around cursor and scroll pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const state = useEditorStore.getState();
      const proj =
        state.projects.find((p) => p.id === state.activeProjectId) ?? state.projects[0];
      const currentZoom = proj.zoom;
      const currentPanX = proj.panX;
      const currentPanY = proj.panY;

      if (e.ctrlKey || e.metaKey) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const factor = Math.exp(-e.deltaY * 0.0025);
        const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * factor));

        const worldX = (mouseX - currentPanX) / currentZoom;
        const worldY = (mouseY - currentPanY) / currentZoom;
        const nextPanX = mouseX - worldX * nextZoom;
        const nextPanY = mouseY - worldY * nextZoom;

        setZoom(nextZoom);
        setPan(nextPanX, nextPanY);
      } else {
        setPan(currentPanX - e.deltaX, currentPanY - e.deltaY);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [setZoom, setPan]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const isMiddleButton = e.button === 1;
    const isBackgroundTarget =
      e.target === containerRef.current || e.target === worldRef.current;
    const shouldPan =
      isMiddleButton ||
      (e.button === 0 && (spacePressed || isBackgroundTarget));

    if (!shouldPan) return;

    e.preventDefault();
    setIsPanning(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const origPanX = project.panX;
    const origPanY = project.panY;
    let moved = false;

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        moved = true;
      }
      setPan(origPanX + dx, origPanY + dy);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setIsPanning(false);
      if (!moved && isBackgroundTarget && e.button === 0) {
        selectNode(null);
        setEditingNode(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    const isBackgroundTarget =
      e.target === containerRef.current || e.target === worldRef.current;
    if (isBackgroundTarget) {
      e.preventDefault();
      onContextMenuCanvas(e);
    }
  };

  const activeDiagId = selectedDiagramId ?? project.activeDiagramId;
  const resetView = useEditorStore((s) => s.resetView);

  const cursorClass = isPanning
    ? 'cursor-grabbing'
    : spacePressed
      ? 'cursor-grab'
      : activeInsertTool
        ? 'cursor-crosshair'
        : 'cursor-default';

  const isViewMoved =
    Math.abs(project.panX) > 20 ||
    Math.abs(project.panY) > 20 ||
    Math.abs(project.zoom - 1) > 0.05;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      className={`relative w-full h-full overflow-hidden bg-slate-200 dark:bg-slate-950 select-none ${cursorClass}`}
    >
      <div
        ref={worldRef}
        style={{
          width: `${BOARD_WIDTH}px`,
          height: `${BOARD_HEIGHT}px`,
          transform: `translate(${project.panX}px, ${project.panY}px) scale(${project.zoom})`,
          transformOrigin: '0 0',
          backgroundImage:
            'radial-gradient(circle, rgba(148, 163, 184, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        className="absolute top-0 left-0 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-lg shadow-xl"
      >
        {project.diagrams.map((doc) => (
          <DiagramWindow
            key={doc.id}
            doc={doc}
            zoom={project.zoom}
            isActive={doc.id === activeDiagId}
            onContextMenuNode={onContextMenuNode}
          />
        ))}
      </div>

      {isViewMoved && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resetView();
          }}
          className="no-print absolute bottom-3 right-3 z-50 px-2.5 py-1.5 text-xs font-medium rounded-md bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="Ansicht zurücksetzen (100%)"
        >
          100% / Zentrieren
        </button>
      )}
    </div>
  );
};
