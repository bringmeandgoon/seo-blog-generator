import { useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSection({ section, index, onUpdate, onDelete, onToggle, isExpanded, allSources, assignedUrls }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.h2);

  const handleTitleSave = () => {
    onUpdate(section.id, { h2: titleDraft });
    setEditingTitle(false);
  };

  const handleKeyPointChange = (idx, value) => {
    const newPoints = [...section.keyPoints];
    newPoints[idx] = value;
    onUpdate(section.id, { keyPoints: newPoints });
  };

  const handleAddKeyPoint = () => {
    onUpdate(section.id, { keyPoints: [...section.keyPoints, ''] });
  };

  const handleRemoveKeyPoint = (idx) => {
    onUpdate(section.id, { keyPoints: section.keyPoints.filter((_, i) => i !== idx) });
  };

  const handleRemoveSource = (url) => {
    onUpdate(section.id, {
      dataSources: section.dataSources.filter(ds => ds.url !== url),
    });
  };

  const handleAddSource = (source) => {
    onUpdate(section.id, {
      dataSources: [...(section.dataSources || []), source],
    });
  };

  // Available sources = allSources not yet assigned to THIS section
  const sectionUrls = new Set((section.dataSources || []).map(ds => ds.url));
  const availableSources = allSources.filter(s => !sectionUrls.has(s.url));

  return (
    <div ref={setNodeRef} style={style} className="border border-dark-200 rounded-xl bg-white mb-2 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 p-3 bg-dark-50">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-dark-400 hover:text-dark-600 flex-shrink-0 touch-none"
          title="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <span className="text-xs font-mono text-dark-400 flex-shrink-0 w-6">{index + 1}.</span>

        {editingTitle ? (
          <input
            type="text"
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
            className="flex-1 px-2 py-1 border border-primary-300 rounded text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 text-sm font-semibold text-dark-800 cursor-pointer hover:text-primary-600"
            onClick={() => { setTitleDraft(section.h2); setEditingTitle(true); }}
            title="Click to edit"
          >
            {section.h2}
          </span>
        )}

        <button
          onClick={() => onToggle(section.id)}
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-dark-400 hover:text-dark-600"
        >
          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => onDelete(section.id)}
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-dark-300 hover:text-red-500 hover:bg-red-50"
          title="Delete section"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 space-y-3 border-t border-dark-100">
          {/* Key Points */}
          <div>
            <div className="text-xs font-medium text-dark-500 mb-1.5">Key Points</div>
            <div className="space-y-1.5">
              {section.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-dark-300 text-xs flex-shrink-0">-</span>
                  <input
                    type="text"
                    value={point}
                    onChange={e => handleKeyPointChange(idx, e.target.value)}
                    className="flex-1 px-2 py-1 border border-dark-200 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                    placeholder="Key point..."
                  />
                  <button
                    onClick={() => handleRemoveKeyPoint(idx)}
                    className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-dark-300 hover:text-red-500"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddKeyPoint}
                className="text-xs text-primary-500 hover:text-primary-700 font-medium"
              >
                + Add Point
              </button>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <div className="text-xs font-medium text-dark-500 mb-1.5">
              Sources ({(section.dataSources || []).length})
            </div>
            <div className="space-y-1">
              {(section.dataSources || []).map((ds, idx) => (
                <div key={idx} className="flex items-center gap-1.5 group">
                  <span className="text-green-500 text-xs flex-shrink-0">&#10003;</span>
                  <a
                    href={ds.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs text-primary-600 hover:underline truncate"
                    title={ds.url}
                  >
                    {ds.label || ds.url}
                  </a>
                  {ds.type && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-dark-100 text-dark-500 flex-shrink-0">
                      {ds.type}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveSource(ds.url)}
                    className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center text-dark-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add source from pool or by URL */}
            <SourcePicker sources={availableSources} onAdd={handleAddSource} />
          </div>
        </div>
      )}
    </div>
  );
}

function SourcePicker({ sources, onAdd }) {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    // Auto-detect type from domain
    let type = 'custom';
    if (url.includes('huggingface.co')) type = 'huggingface';
    else if (url.includes('novita.ai')) type = 'novita';
    else if (url.includes('reddit.com')) type = 'reddit';
    else if (url.includes('artificialanalysis.ai')) type = 'benchmark';
    else type = 'blog';
    // Use domain + path as label
    let label = url;
    try {
      const u = new URL(url);
      label = u.hostname + u.pathname.slice(0, 60);
    } catch {}
    onAdd({ url, label, type });
    setUrlInput('');
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary-500 hover:text-primary-700 font-medium mt-1"
      >
        + Add Source
      </button>
    );
  }

  return (
    <div className="mt-1.5 p-2 bg-dark-50 rounded-lg border border-dark-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-dark-400">Add Sources</span>
        <button onClick={() => setOpen(false)} className="text-[10px] text-dark-400 hover:text-dark-600">Close</button>
      </div>

      {/* Manual URL input */}
      <div className="flex gap-1 mb-1.5">
        <input
          type="text"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
          placeholder="Paste URL to add..."
          className="flex-1 px-2 py-1 border border-dark-200 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
        />
        <button
          onClick={handleAddUrl}
          disabled={!urlInput.trim()}
          className="px-2 py-1 rounded text-xs font-medium bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {/* Pool sources */}
      {sources.length > 0 && (
        <div className="max-h-32 overflow-y-auto space-y-0.5">
          <div className="text-[10px] text-dark-400 mb-0.5">From research pool:</div>
          {sources.map((s, i) => (
            <button
              key={i}
              onClick={() => { onAdd(s); }}
              className="w-full text-left text-xs px-1.5 py-1 rounded hover:bg-primary-50 text-dark-600 hover:text-primary-700 truncate block"
              title={s.url}
            >
              <span className="text-primary-400 mr-1">+</span>
              {s.label || s.url}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OutlineEditor({ data, onConfirm, onCancel }) {
  const [sections, setSections] = useState(() => {
    const outline = data.outline || {};
    return (outline.sections || []).map((s, i) => ({
      ...s,
      id: s.id || `s${i + 1}`,
      keyPoints: s.keyPoints || [],
      dataSources: s.dataSources || [],
    }));
  });
  const [expandedIds, setExpandedIds] = useState(() => new Set(sections.map(s => s.id)));
  const allSources = data.allSources || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSections(prev => {
        const oldIndex = prev.findIndex(s => s.id === active.id);
        const newIndex = prev.findIndex(s => s.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleUpdate = useCallback((id, updates) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleDelete = useCallback((id) => {
    setSections(prev => prev.filter(s => s.id !== id));
    setExpandedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  const handleToggle = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAddSection = () => {
    const newId = `s${Date.now()}`;
    setSections(prev => [...prev, {
      id: newId,
      h2: 'New Section',
      keyPoints: [''],
      dataSources: [],
    }]);
    setExpandedIds(prev => new Set([...prev, newId]));
  };

  const handleConfirm = () => {
    onConfirm({ sections });
  };

  // Compute assigned URLs across all sections
  const assignedUrls = new Set(sections.flatMap(s => (s.dataSources || []).map(ds => ds.url)));

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-dark-900">Article Outline</h2>
            <p className="text-xs text-dark-400">Drag to reorder, click to edit titles, manage sources per section</p>
          </div>
        </div>
        <button
          onClick={handleAddSection}
          className="btn bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Section
        </button>
      </div>

      {/* Sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <SortableSection
              key={section.id}
              section={section}
              index={index}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggle={handleToggle}
              isExpanded={expandedIds.has(section.id)}
              allSources={allSources}
              assignedUrls={assignedUrls}
            />
          ))}
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="text-sm text-dark-400 text-center py-8">
          No sections. Click "Add Section" to start building the outline.
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleConfirm}
          disabled={sections.length === 0}
          className="btn btn-primary flex-1"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Confirm & Generate Article
        </button>
        <button
          onClick={onCancel}
          className="btn bg-dark-100 text-dark-600 hover:bg-dark-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
