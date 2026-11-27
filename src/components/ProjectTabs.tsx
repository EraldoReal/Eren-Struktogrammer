import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { confirmAction } from '../utils/confirm';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';

export const ProjectTabs: React.FC = () => {
  const projects = useEditorStore((s) => s.projects);
  const activeProjectId = useEditorStore((s) => s.activeProjectId);
  const setActiveProject = useEditorStore((s) => s.setActiveProject);
  const newProject = useEditorStore((s) => s.newProject);
  const closeProject = useEditorStore((s) => s.closeProject);
  const renameProject = useEditorStore((s) => s.renameProject);
  const language = useEditorStore((s) => s.appSettings.language);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const t = getTranslations(language);

  const startRename = (projectId: string, currentName: string) => {
    setEditingId(projectId);
    setDraftName(currentName);
  };

  const commitRename = () => {
    if (!editingId) return;
    const trimmed = draftName.trim();
    if (trimmed.length > 0) {
      renameProject(editingId, trimmed);
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  return (
    <div
      role="tablist"
      aria-label="Projects"
      className="flex items-center gap-1 px-2 pt-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-x-auto select-none"
    >
      {projects.map((project) => {
        const isActive = project.id === activeProjectId;
        const isEditing = editingId === project.id;

        return (
          <div
            key={project.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActiveProject(project.id)}
            onDoubleClick={() => startRename(project.id, project.name)}
            title={
              language === 'de'
                ? `${project.name} (Doppelklick zum Umbenennen)`
                : `${project.name} (Double-click to rename)`
            }
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs font-medium cursor-pointer border border-b-0 transition-colors max-w-[220px] ${
              isActive
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 -mb-px pb-[7px]'
                : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {project.dirty && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                title={t.status.unsaved}
              />
            )}

            {isEditing ? (
              <input
                type="text"
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitRename();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelRename();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-28 px-1 py-0.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-blue-500 rounded outline-none"
              />
            ) : (
              <span className="truncate">
                {project.name}
                {project.dirty && (
                  <span className="text-amber-500 font-bold ml-0.5" title={t.status.unsaved}>
                    *
                  </span>
                )}
              </span>
            )}

            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (project.dirty) {
                  const msg =
                    language === 'de'
                      ? `Das Projekt „${project.name}“ enthält ungespeicherte Änderungen. Trotzdem schließen?`
                      : `Project "${project.name}" has unsaved changes. Close anyway?`;
                  if (!(await confirmAction(msg))) return;
                }
                closeProject(project.id);
              }}
              title={t.menu.closeProject}
              aria-label={`${t.menu.closeProject}: ${project.name}`}
              className={`p-0.5 rounded hover:bg-slate-300/70 dark:hover:bg-slate-700 transition-opacity ${
                isActive ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => newProject()}
        title={t.menu.newProject}
        aria-label={t.menu.newProject}
        className="flex items-center justify-center w-6 h-6 mb-1 ml-0.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
