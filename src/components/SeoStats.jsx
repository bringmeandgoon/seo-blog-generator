import { useState, useEffect, useMemo } from 'react';

const API_BASE = '';

export default function SeoStats({ onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('latestClicks');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const headers = {};
    const savedPw = localStorage.getItem('_ap');
    if (savedPw) headers['x-access-password'] = savedPw;
    fetch(`${API_BASE}/api/seo/ashuia-trends`, { headers })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'publishTime' || key === 'title');
    }
  };

  const sortedArticles = useMemo(() => {
    if (!data?.articles) return [];
    const list = [...data.articles];
    list.sort((a, b) => {
      let va, vb;
      if (sortKey === 'publishTime' || sortKey === 'title' || sortKey === 'category') {
        va = a[sortKey] || '';
        vb = b[sortKey] || '';
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      if (sortKey === 'latestClicks') {
        va = a.latestClicks;
        vb = b.latestClicks;
      } else if (sortKey.startsWith('week_')) {
        const [, week, metric] = sortKey.match(/^week_(.+)_(.+)$/);
        va = a.weeks[week]?.[metric] || 0;
        vb = b.weeks[week]?.[metric] || 0;
      } else {
        va = a[sortKey] || 0;
        vb = b[sortKey] || 0;
      }
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [data, sortKey, sortAsc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Failed to load: {error}</p>
        <p className="text-dark-400 text-sm">Make sure server.js is running on port 3001</p>
      </div>
    );
  }

  if (!data || !data.articles?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-500">No SEO data yet.</p>
        <p className="text-dark-400 text-sm mt-2">Data will appear after weekly snapshots run.</p>
      </div>
    );
  }

  const { weeks, weeklyTotals } = data;

  const SortIcon = ({ active, asc }) => (
    <span className={`ml-0.5 inline-block ${active ? 'text-primary-600' : 'text-dark-300'}`}>
      {active ? (asc ? '▲' : '▼') : '⇅'}
    </span>
  );

  const SortHeader = ({ label, sortId, className = '' }) => (
    <th
      className={`px-3 py-2 text-xs font-semibold text-dark-500 cursor-pointer hover:text-primary-600 select-none ${className}`}
      onClick={() => handleSort(sortId)}
    >
      {label}
      <SortIcon active={sortKey === sortId} asc={sortAsc} />
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-dark-900">SEO Article Tracking</h2>
          <p className="text-dark-400 mt-1">
            {sortedArticles.length} articles by 阿水 · {weeks.length} week(s) of data
          </p>
        </div>
        <button onClick={onBack} className="btn btn-ghost text-dark-500 hover:text-dark-700">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Weekly totals summary */}
      {weeklyTotals && weeklyTotals.length > 0 && (
        <div className="border border-dark-200 rounded-xl overflow-hidden">
          <div className="bg-dark-50 px-4 py-3 border-b border-dark-200">
            <h3 className="text-sm font-bold text-dark-700">Weekly Totals (All 阿水 Articles)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="border-b border-dark-200 bg-dark-50/50">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-dark-500 w-24">Week</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-dark-500">Clicks</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-dark-500">Impressions</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-dark-500">CTR</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-dark-500">Avg Position</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-dark-500">Articles</th>
                </tr>
              </thead>
              <tbody>
                {weeklyTotals.map((wt, i) => {
                  const prev = i > 0 ? weeklyTotals[i - 1] : null;
                  const clickDelta = prev ? wt.clicks - prev.clicks : null;
                  return (
                    <tr key={wt.week} className="border-b border-dark-100 hover:bg-dark-50/30">
                      <td className="px-4 py-2 text-xs font-medium text-dark-700">{wt.week.slice(5).replace('-', '/')}</td>
                      <td className="px-4 py-2 text-right font-mono text-sm font-bold text-primary-600">
                        {wt.clicks}
                        {clickDelta !== null && (
                          <span className={`ml-2 text-[10px] font-normal ${clickDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {clickDelta >= 0 ? '+' : ''}{clickDelta}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-sm text-dark-600">{wt.impressions}</td>
                      <td className="px-4 py-2 text-right font-mono text-sm text-dark-600">{wt.ctr}%</td>
                      <td className="px-4 py-2 text-right font-mono text-sm text-dark-600">{wt.avgPosition}</td>
                      <td className="px-4 py-2 text-right text-sm text-dark-500">{wt.articles}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-article table */}
      <div className="border border-dark-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-sm w-full" style={{ minWidth: `${600 + weeks.length * 280}px` }}>
            <thead>
              {/* Week header row */}
              <tr className="bg-dark-50 border-b border-dark-200">
                <th className="sticky left-0 z-20 bg-dark-50 px-3 py-2 text-left text-xs font-semibold text-dark-500 w-10">#</th>
                <th className="sticky left-10 z-20 bg-dark-50 px-3 py-2 text-left text-xs font-semibold text-dark-500 w-16 cursor-pointer hover:text-primary-600 select-none"
                    onClick={() => handleSort('category')}>
                  类型<SortIcon active={sortKey === 'category'} asc={sortAsc} />
                </th>
                <th className="sticky left-[104px] z-20 bg-dark-50 px-3 py-2 text-left text-xs font-semibold text-dark-500 min-w-[240px] cursor-pointer hover:text-primary-600 select-none"
                    onClick={() => handleSort('title')}>
                  文章标题<SortIcon active={sortKey === 'title'} asc={sortAsc} />
                </th>
                <th className="sticky left-[344px] z-20 bg-dark-50 px-3 py-2 text-left text-xs font-semibold text-dark-500 w-24 cursor-pointer hover:text-primary-600 select-none"
                    onClick={() => handleSort('publishTime')}>
                  发布时间<SortIcon active={sortKey === 'publishTime'} asc={sortAsc} />
                </th>
                {weeks.map(w => (
                  <th key={w} colSpan={4} className="px-2 py-2 text-center text-xs font-bold text-primary-600 border-l border-dark-200">
                    {w.slice(5).replace('-', '/')}
                  </th>
                ))}
              </tr>
              {/* Sub-header for each week's metrics */}
              <tr className="bg-dark-50/50 border-b border-dark-200">
                <th className="sticky left-0 z-20 bg-dark-50/50"></th>
                <th className="sticky left-10 z-20 bg-dark-50/50"></th>
                <th className="sticky left-[104px] z-20 bg-dark-50/50"></th>
                <th className="sticky left-[344px] z-20 bg-dark-50/50"></th>
                {weeks.map(w => (
                  <F key={w}>
                    <th className="px-2 py-1 text-center text-[10px] font-medium text-dark-400 border-l border-dark-200 w-12 cursor-pointer hover:text-primary-600 select-none"
                        onClick={() => handleSort(`week_${w}_position`)}>
                      排名<SortIcon active={sortKey === `week_${w}_position`} asc={sortAsc} />
                    </th>
                    <th className="px-2 py-1 text-center text-[10px] font-medium text-dark-400 w-16 cursor-pointer hover:text-primary-600 select-none"
                        onClick={() => handleSort(`week_${w}_clicks`)}>
                      点击<SortIcon active={sortKey === `week_${w}_clicks`} asc={sortAsc} />
                    </th>
                    <th className="px-2 py-1 text-center text-[10px] font-medium text-dark-400 w-16 cursor-pointer hover:text-primary-600 select-none"
                        onClick={() => handleSort(`week_${w}_impressions`)}>
                      展现<SortIcon active={sortKey === `week_${w}_impressions`} asc={sortAsc} />
                    </th>
                    <th className="px-2 py-1 text-center text-[10px] font-medium text-dark-400 w-12 cursor-pointer hover:text-primary-600 select-none"
                        onClick={() => handleSort(`week_${w}_ctr`)}>
                      CTR<SortIcon active={sortKey === `week_${w}_ctr`} asc={sortAsc} />
                    </th>
                  </F>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedArticles.map((art, i) => (
                <tr key={art.slug} className={`border-b border-dark-100 ${i % 2 === 0 ? 'bg-white' : 'bg-dark-50/30'} hover:bg-primary-50/30 transition-colors`}>
                  <td className="sticky left-0 z-10 bg-inherit px-3 py-2 text-dark-400 text-xs">{i + 1}</td>
                  <td className="sticky left-10 z-10 bg-inherit px-3 py-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-dark-100 text-dark-600 whitespace-nowrap">
                      {art.category || '-'}
                    </span>
                  </td>
                  <td className="sticky left-[104px] z-10 bg-inherit px-3 py-2">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-dark-800 hover:text-primary-600 hover:underline"
                      title={art.title}
                    >
                      {art.title}
                    </a>
                  </td>
                  <td className="sticky left-[344px] z-10 bg-inherit px-3 py-2 text-xs text-dark-500 whitespace-nowrap">
                    {art.publishTime || '-'}
                  </td>
                  {weeks.map(w => {
                    const d = art.weeks[w];
                    if (!d) {
                      return (
                        <F key={w}>
                          <td className="px-2 py-2 text-center text-xs text-dark-300 border-l border-dark-100">-</td>
                          <td className="px-2 py-2 text-center text-xs text-dark-300">-</td>
                          <td className="px-2 py-2 text-center text-xs text-dark-300">-</td>
                          <td className="px-2 py-2 text-center text-xs text-dark-300">-</td>
                        </F>
                      );
                    }
                    return (
                      <F key={w}>
                        <td className="px-2 py-2 text-center text-xs text-dark-600 border-l border-dark-100 font-mono">
                          {d.position > 0 ? d.position.toFixed(1) : '-'}
                        </td>
                        <td className={`px-2 py-2 text-center text-xs font-mono font-semibold ${d.clicks > 10 ? 'text-primary-600' : d.clicks > 0 ? 'text-dark-700' : 'text-dark-300'}`}>
                          {d.clicks}
                        </td>
                        <td className="px-2 py-2 text-center text-xs text-dark-500 font-mono">
                          {d.impressions}
                        </td>
                        <td className="px-2 py-2 text-center text-xs text-dark-500 font-mono">
                          {d.ctr > 0 ? `${d.ctr}%` : '-'}
                        </td>
                      </F>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function F({ children }) {
  return <>{children}</>;
}
