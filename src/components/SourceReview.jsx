import { useState } from 'react';

const CATEGORY_LABELS = {
  huggingface: 'HuggingFace',
  review: 'Topic Search',
  reddit: 'Reddit',
  blog_priority: 'Blog (Medium/dev.to)',
  aa: 'Artificial Analysis',
  provider_0: 'Provider',
  provider_1: 'Provider',
  provider_2: 'Provider',
  additional_0: 'Additional Search',
  additional_1: 'Additional Search',
  additional: 'Additional Search',
};

const CATEGORY_COLORS = {
  huggingface: 'bg-yellow-100 text-yellow-800',
  review: 'bg-blue-100 text-blue-800',
  reddit: 'bg-orange-100 text-orange-800',
  blog_priority: 'bg-green-100 text-green-800',
  aa: 'bg-cyan-100 text-cyan-800',
  provider_0: 'bg-purple-100 text-purple-800',
  provider_1: 'bg-purple-100 text-purple-800',
  provider_2: 'bg-purple-100 text-purple-800',
  additional_0: 'bg-pink-100 text-pink-800',
  additional_1: 'bg-pink-100 text-pink-800',
  additional: 'bg-pink-100 text-pink-800',
};

export default function SourceReview({ data, onConfirm, onSearchMore, isLoading }) {
  const [feedback, setFeedback] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [removedUrls, setRemovedUrls] = useState([]);

  const { sources = [], summary = {}, rawContext = '' } = data;

  const visibleSources = sources.filter(s => !removedUrls.includes(s.url));

  const handleRemoveSource = (url) => {
    setRemovedUrls(prev => [...prev, url]);
  };

  const handleUndoRemove = (url) => {
    setRemovedUrls(prev => prev.filter(u => u !== url));
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-dark-900">Source Review</h2>
          <p className="text-xs text-dark-400">Review pre-search data before generating article</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-dark-50 rounded-xl p-3">
          <div className="text-xs text-dark-400 mb-1">HF Repo</div>
          <div className="text-sm font-semibold text-dark-800 truncate" title={summary.hfRepo}>
            {summary.hfRepo || 'Not found'}
          </div>
        </div>
        <div className="bg-dark-50 rounded-xl p-3">
          <div className="text-xs text-dark-400 mb-1">Params</div>
          <div className="text-sm font-semibold text-dark-800">{summary.hfParams || '-'}</div>
        </div>
        <div className="bg-dark-50 rounded-xl p-3">
          <div className="text-xs text-dark-400 mb-1">Web Sources</div>
          <div className="text-sm font-semibold text-dark-800">{visibleSources.length}</div>
        </div>
        <div className="bg-dark-50 rounded-xl p-3">
          <div className="text-xs text-dark-400 mb-1">Context Size</div>
          <div className="text-sm font-semibold text-dark-800">{summary.contextSize ? `${(summary.contextSize / 1024).toFixed(1)}KB` : '-'}</div>
        </div>
      </div>

      {/* Novita Pricing */}
      {summary.novitaMatch && (
        <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200">
          <div className="text-xs text-green-600 font-medium mb-1">Novita AI Pricing Match</div>
          <div className="text-sm font-mono text-green-800">{summary.novitaMatch}</div>
        </div>
      )}

      {/* Provider Count */}
      {summary.providerCount > 0 && (
        <div className="mb-5 p-3 rounded-xl bg-purple-50 border border-purple-200">
          <div className="text-xs text-purple-600 font-medium">OpenRouter Providers: {summary.providerCount}</div>
        </div>
      )}

      {/* Source List */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-dark-700">
            Sources ({visibleSources.length})
            {removedUrls.length > 0 && (
              <span className="ml-2 text-xs font-normal text-red-500">
                {removedUrls.length} removed
              </span>
            )}
          </h3>
        </div>
        <div className="space-y-2 pr-1">
          {visibleSources.map((s, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-dark-50 transition-colors group">
              <span className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[s.category] || 'bg-gray-100 text-gray-700'}`}>
                {CATEGORY_LABELS[s.category] || s.category}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline block truncate"
                  title={s.title}
                >
                  {s.title || s.url}
                </a>
                {s.snippet && (
                  <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">{s.snippet}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveSource(s.url)}
                className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-dark-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Remove this source"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {visibleSources.length === 0 && removedUrls.length === 0 && (
            <div className="text-sm text-dark-400 text-center py-4">No web sources found</div>
          )}
        </div>

        {/* Removed sources - undo */}
        {removedUrls.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
            <div className="text-xs font-medium text-red-600 mb-2">Removed Sources (will be stripped from context)</div>
            <div className="space-y-1">
              {removedUrls.map((url, i) => {
                const src = sources.find(s => s.url === url);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs text-red-500">
                    <span className="truncate flex-1 line-through">{src?.title || url}</span>
                    <button
                      onClick={() => handleUndoRemove(url)}
                      className="flex-shrink-0 text-red-400 hover:text-red-600 font-medium"
                    >
                      Undo
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Raw Context Toggle */}
      <div className="mb-5">
        <button
          onClick={() => setShowContext(!showContext)}
          className="flex items-center text-sm font-medium text-dark-500 hover:text-dark-700 transition-colors"
        >
          <svg className={`w-4 h-4 mr-1.5 transition-transform ${showContext ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Raw Context ({summary.contextSize ? `${(summary.contextSize / 1024).toFixed(1)}KB` : '...'})
        </button>
        {showContext && (
          <pre className="mt-2 p-3 bg-dark-50 rounded-xl text-xs font-mono text-dark-600 overflow-auto max-h-96 whitespace-pre-wrap break-words border border-dark-200">
            {rawContext || '(empty)'}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Search More */}
        <div className="flex gap-2">
          <input
            type="text"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Need more info? Type search query..."
            className="flex-1 px-3 py-2 border border-dark-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            disabled={isLoading}
            onKeyDown={e => {
              if (e.key === 'Enter' && feedback.trim() && !isLoading) {
                onSearchMore(feedback.trim(), removedUrls);
                setFeedback('');
              }
            }}
          />
          <button
            onClick={() => { onSearchMore(feedback.trim(), removedUrls); setFeedback(''); }}
            disabled={isLoading || !feedback.trim()}
            className="btn bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search More
          </button>
        </div>

        {/* Confirm */}
        <button
          onClick={() => onConfirm(removedUrls)}
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <div className="spinner border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirm & Generate Article
              {removedUrls.length > 0 && ` (${removedUrls.length} sources removed)`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
