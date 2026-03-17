import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';

// ============================================================
// CompareView — Dark-themed model comparison page
// ============================================================

const DEFAULT_COLORS = ['#FF6B35', '#4A90E2'];

function getColors(data) {
  return [
    data?.models?.a?.color || DEFAULT_COLORS[0],
    data?.models?.b?.color || DEFAULT_COLORS[1],
  ];
}

// ---------- Hero Header ----------
function CompareHeader({ data, colors }) {
  const modelA = data.models?.a;
  const modelB = data.models?.b;

  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-gray-400 mb-6">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Model Comparison
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
        <span style={{ color: colors[0] }}>{modelA?.name || 'Model A'}</span>
        <span className="text-gray-600 mx-4">vs</span>
        <span style={{ color: colors[1] }}>{modelB?.name || 'Model B'}</span>
      </h1>

      {data.summary && (
        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
          {data.summary}
        </p>
      )}

      {/* Quick stat pills */}
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {data.params?.a != null && data.params?.b != null && (
          <div className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm">
            <span className="text-gray-500">Params:</span>{' '}
            <span style={{ color: colors[0] }} className="font-semibold">{data.params.a}{data.params.unit}</span>
            <span className="text-gray-600 mx-1">vs</span>
            <span style={{ color: colors[1] }} className="font-semibold">{data.params.b}{data.params.unit}</span>
          </div>
        )}
        {data.context_window?.a && data.context_window?.b && (
          <div className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm">
            <span className="text-gray-500">Context:</span>{' '}
            <span style={{ color: colors[0] }} className="font-semibold">{data.context_window.a}</span>
            <span className="text-gray-600 mx-1">vs</span>
            <span style={{ color: colors[1] }} className="font-semibold">{data.context_window.b}</span>
          </div>
        )}
        {data.license?.a && data.license?.b && (
          <div className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm">
            <span className="text-gray-500">License:</span>{' '}
            <span className="text-gray-300 font-semibold">{data.license.a === data.license.b ? data.license.a : `${data.license.a} / ${data.license.b}`}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Custom Tooltip ----------
function CustomTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

// ---------- Benchmarks ----------
function BenchmarkChart({ data, colors }) {
  const benchmarks = data.benchmarks;
  if (!benchmarks?.length) return null;

  const nameA = data.models?.a?.name || 'Model A';
  const nameB = data.models?.b?.name || 'Model B';

  return (
    <Section title="Benchmark Scores" subtitle="Higher is better">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={benchmarks} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#2a2a2a' }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#2a2a2a' }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip colors={colors} />} />
            <Legend
              wrapperStyle={{ color: '#9ca3af', fontSize: 13 }}
              iconType="circle"
            />
            <Bar dataKey="a" name={nameA} fill={colors[0]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="b" name={nameB} fill={colors[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Winner badges per benchmark */}
      <div className="flex flex-wrap gap-2 mt-4">
        {benchmarks.map((b, i) => {
          if (b.a == null || b.b == null) return null;
          const winner = b.a > b.b ? 'a' : b.b > b.a ? 'b' : null;
          if (!winner) return null;
          const diff = Math.abs(b.a - b.b).toFixed(1);
          return (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                color: winner === 'a' ? colors[0] : colors[1],
                borderColor: winner === 'a' ? colors[0] + '40' : colors[1] + '40',
                backgroundColor: (winner === 'a' ? colors[0] : colors[1]) + '10',
              }}
            >
              {data.models?.[winner]?.name} +{diff} on {b.name}
            </span>
          );
        })}
      </div>
    </Section>
  );
}

// ---------- Pricing ----------
function PricingChart({ data, colors }) {
  const pricing = data.pricing;
  if (!pricing?.a && !pricing?.b) return null;

  const nameA = data.models?.a?.name || 'Model A';
  const nameB = data.models?.b?.name || 'Model B';

  // Detect if this is tool pricing (free/pro tiers) vs model pricing (input/output tokens)
  const isTool = data.features || data.supported_ides;
  const label1 = isTool ? 'Free Tier ($/mo)' : 'Input (per 1M tokens)';
  const label2 = isTool ? 'Pro/Paid Tier ($/mo)' : 'Output (per 1M tokens)';
  const subtitle = isTool ? 'Monthly subscription pricing (USD)' : 'USD per 1M tokens — lower is cheaper';

  const chartData = [
    { name: label1, a: pricing.a?.input, b: pricing.b?.input },
    { name: label2, a: pricing.a?.output, b: pricing.b?.output },
  ].filter(d => d.a != null || d.b != null);

  if (!chartData.length) return null;

  return (
    <Section title="Pricing" subtitle={subtitle}>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#2a2a2a' }} tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#2a2a2a' }} width={160} />
            <Tooltip content={<CustomTooltip colors={colors} />} formatter={(v) => `$${v}`} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 13 }} iconType="circle" />
            <Bar dataKey="a" name={nameA} fill={colors[0]} radius={[0, 4, 4, 0]} />
            <Bar dataKey="b" name={nameB} fill={colors[1]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cost comparison summary */}
      {pricing.a?.output != null && pricing.b?.output != null && pricing.a.output !== pricing.b.output && (
        <div className="mt-4 p-4 rounded-xl bg-[#111] border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm">
            {pricing.a.output < pricing.b.output ? (
              <><span style={{ color: colors[0] }} className="font-semibold">{nameA}</span> is <span className="text-green-400 font-semibold">{((1 - pricing.a.output / pricing.b.output) * 100).toFixed(0)}% cheaper</span> on {isTool ? 'pro tier' : 'output tokens'}</>
            ) : (
              <><span style={{ color: colors[1] }} className="font-semibold">{nameB}</span> is <span className="text-green-400 font-semibold">{((1 - pricing.b.output / pricing.a.output) * 100).toFixed(0)}% cheaper</span> on {isTool ? 'pro tier' : 'output tokens'}</>
            )}
          </p>
        </div>
      )}
    </Section>
  );
}

// ---------- Model Size ----------
function ModelSizeChart({ data, colors }) {
  const params = data.params;
  if (params?.a == null && params?.b == null) return null;

  const nameA = data.models?.a?.name || 'Model A';
  const nameB = data.models?.b?.name || 'Model B';
  const unit = params.unit || 'B';

  const chartData = [
    { name: nameA, value: params.a, fill: colors[0] },
    { name: nameB, value: params.b, fill: colors[1] },
  ].filter(d => d.value != null);

  if (!chartData.length) return null;

  return (
    <Section title="Model Size" subtitle={`Total parameters (${unit})`}>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#2a2a2a' }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#2a2a2a' }} tickFormatter={(v) => `${v}${unit}`} />
            <Tooltip content={<CustomTooltip colors={colors} />} formatter={(v) => `${v}${unit}`} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {params.a != null && params.b != null && (
        <div className="mt-3 text-center">
          <span className="px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-gray-400">
            {params.a > params.b
              ? `${nameA} is ${(params.a / params.b).toFixed(1)}x larger`
              : params.b > params.a
              ? `${nameB} is ${(params.b / params.a).toFixed(1)}x larger`
              : 'Same size'}
          </span>
        </div>
      )}
    </Section>
  );
}

// ---------- Info Cards (License, Release, + Tool-specific fields) ----------
function InfoCards({ data, colors }) {
  const items = [
    { label: 'License', a: data.license?.a, b: data.license?.b },
    { label: 'Release Date', a: data.release?.a, b: data.release?.b },
    { label: 'Context Window', a: data.context_window?.a, b: data.context_window?.b },
    // Tool-specific fields
    data.supported_ides && { label: 'Supported IDEs', a: data.supported_ides?.a, b: data.supported_ides?.b },
    data.supported_models && { label: 'AI Models', a: data.supported_models?.a, b: data.supported_models?.b },
  ].filter(item => item && (item.a || item.b));

  if (!items.length) return null;

  const nameA = data.models?.a?.name || 'Model A';
  const nameB = data.models?.b?.name || 'Model B';

  return (
    <Section title="Specifications">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model A card */}
        <div className="p-5 rounded-2xl bg-[#111] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }} />
            <h4 className="text-white font-semibold">{nameA}</h4>
          </div>
          <dl className="space-y-3">
            {items.map((item, i) => (
              <div key={i}>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</dt>
                <dd className="text-gray-200 font-medium mt-0.5">{item.a || 'Unknown'}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Model B card */}
        <div className="p-5 rounded-2xl bg-[#111] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[1] }} />
            <h4 className="text-white font-semibold">{nameB}</h4>
          </div>
          <dl className="space-y-3">
            {items.map((item, i) => (
              <div key={i}>
                <dt className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</dt>
                <dd className="text-gray-200 font-medium mt-0.5">{item.b || 'Unknown'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

// ---------- Key Takeaways ----------
function TakeawaysCards({ data, colors }) {
  const takeaways = data.takeaways;
  if (!takeaways?.a?.length && !takeaways?.b?.length) return null;

  const nameA = data.models?.a?.name || 'Model A';
  const nameB = data.models?.b?.name || 'Model B';

  return (
    <Section title="Key Takeaways">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model A takeaways */}
        <div className="p-5 rounded-2xl bg-[#111] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }} />
            <h4 className="text-white font-semibold">{nameA}</h4>
          </div>
          <ul className="space-y-2">
            {(takeaways.a || []).map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors[0] }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Model B takeaways */}
        <div className="p-5 rounded-2xl bg-[#111] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[1] }} />
            <h4 className="text-white font-semibold">{nameB}</h4>
          </div>
          <ul className="space-y-2">
            {(takeaways.b || []).map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors[1] }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// ---------- Features (for tools) ----------
function FeaturesCards({ data, colors }) {
  const features = data.features;
  if (!features?.a?.length && !features?.b?.length) return null;

  const nameA = data.models?.a?.name || 'Tool A';
  const nameB = data.models?.b?.name || 'Tool B';

  return (
    <Section title="Features">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#111] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[0] }} />
            <h4 className="text-white font-semibold">{nameA}</h4>
          </div>
          <ul className="space-y-2">
            {(features.a || []).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-gray-600 mt-0.5">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 rounded-2xl bg-[#111] border border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[1] }} />
            <h4 className="text-white font-semibold">{nameB}</h4>
          </div>
          <ul className="space-y-2">
            {(features.b || []).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-gray-600 mt-0.5">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// ---------- Detailed Comparison Table ----------
function CompareTable({ data, colors }) {
  const nameA = data.models?.a?.name || 'Model A';
  const nameB = data.models?.b?.name || 'Model B';

  const isTool = !!(data.features || data.supported_ides);

  // Build table rows from all available data
  const rows = useMemo(() => {
    const result = [];

    if (data.params?.a != null || data.params?.b != null) {
      result.push({ label: 'Parameters', a: data.params.a != null ? `${data.params.a}${data.params.unit || 'B'}` : '—', b: data.params.b != null ? `${data.params.b}${data.params.unit || 'B'}` : '—' });
    }
    if (data.context_window?.a || data.context_window?.b) {
      result.push({ label: 'Context Window', a: data.context_window.a || '—', b: data.context_window.b || '—' });
    }
    if (data.license?.a || data.license?.b) {
      result.push({ label: 'License', a: data.license.a || '—', b: data.license.b || '—' });
    }
    if (data.release?.a || data.release?.b) {
      result.push({ label: 'Release Date', a: data.release.a || '—', b: data.release.b || '—' });
    }
    // Tool-specific fields
    if (data.supported_ides?.a || data.supported_ides?.b) {
      result.push({ label: 'Supported IDEs', a: data.supported_ides.a || '—', b: data.supported_ides.b || '—' });
    }
    if (data.supported_models?.a || data.supported_models?.b) {
      result.push({ label: 'AI Models', a: data.supported_models.a || '—', b: data.supported_models.b || '—' });
    }
    // Pricing
    if (data.pricing?.a || data.pricing?.b) {
      const priceLabel1 = isTool ? 'Free Tier' : 'Input Price';
      const priceLabel2 = isTool ? 'Pro Tier' : 'Output Price';
      const priceFmt = (v) => isTool ? (v === 0 ? 'Free' : `$${v}/mo`) : `$${v}/1M`;
      result.push({
        label: priceLabel1,
        a: data.pricing.a?.input != null ? priceFmt(data.pricing.a.input) : '—',
        b: data.pricing.b?.input != null ? priceFmt(data.pricing.b.input) : '—',
      });
      result.push({
        label: priceLabel2,
        a: data.pricing.a?.output != null ? priceFmt(data.pricing.a.output) : '—',
        b: data.pricing.b?.output != null ? priceFmt(data.pricing.b.output) : '—',
      });
    }

    // Add benchmark rows
    (data.benchmarks || []).forEach(b => {
      result.push({
        label: b.name,
        a: b.a != null ? String(b.a) : '—',
        b: b.b != null ? String(b.b) : '—',
        isScore: true,
        scoreA: b.a,
        scoreB: b.b,
      });
    });

    return result;
  }, [data]);

  if (!rows.length) return null;

  return (
    <Section title="Full Comparison" subtitle="All specs at a glance">
      <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left px-4 py-3 text-gray-500 font-medium bg-[#111]">Metric</th>
              <th className="text-center px-4 py-3 font-semibold bg-[#111]" style={{ color: colors[0] }}>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[0] }} />
                  {nameA}
                </div>
              </th>
              <th className="text-center px-4 py-3 font-semibold bg-[#111]" style={{ color: colors[1] }}>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[1] }} />
                  {nameB}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const winnerColor = row.isScore && row.scoreA != null && row.scoreB != null
                ? row.scoreA > row.scoreB ? colors[0] : row.scoreB > row.scoreA ? colors[1] : null
                : null;

              return (
                <tr key={i} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-center text-gray-200">
                    <span
                      className={row.isScore && winnerColor === colors[0] ? 'font-bold' : ''}
                      style={row.isScore && winnerColor === colors[0] ? { color: colors[0] } : {}}
                    >
                      {row.a}
                    </span>
                    {row.isScore && row.scoreA != null && row.scoreB != null && (
                      <ScoreBar value={row.scoreA} max={Math.max(row.scoreA, row.scoreB)} color={colors[0]} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-200">
                    <span
                      className={row.isScore && winnerColor === colors[1] ? 'font-bold' : ''}
                      style={row.isScore && winnerColor === colors[1] ? { color: colors[1] } : {}}
                    >
                      {row.b}
                    </span>
                    {row.isScore && row.scoreA != null && row.scoreB != null && (
                      <ScoreBar value={row.scoreB} max={Math.max(row.scoreA, row.scoreB)} color={colors[1]} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// CSS progress bar for score cells
function ScoreBar({ value, max, color }) {
  if (value == null || max == null || max === 0) return null;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mt-1 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ---------- Sources ----------
function SourcesList({ data }) {
  const sources = data.sources;
  if (!sources?.length) return null;

  return (
    <Section title="Sources">
      <div className="space-y-2">
        {sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors group"
          >
            <span className="text-gray-600 text-xs font-mono">[{i + 1}]</span>
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors flex-1 truncate">
              {s.title || s.url}
            </span>
            <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </Section>
  );
}

// ---------- Section wrapper ----------
function Section({ title, subtitle, children }) {
  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// Main CompareView component
// ============================================================
export default function CompareView({ article, onBack }) {
  // Parse compare data — could be an object or a JSON string
  const data = useMemo(() => {
    if (article.compareData && typeof article.compareData === 'object') {
      return article.compareData;
    }
    if (typeof article.content === 'string') {
      try { return JSON.parse(article.content); } catch { return null; }
    }
    if (typeof article.content === 'object') {
      return article.content;
    }
    return null;
  }, [article]);

  const colors = useMemo(() => getColors(data), [data]);

  if (!data) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen p-8 text-white">
        <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to List
        </button>
        <p className="text-gray-500">Failed to parse comparison data.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen rounded-2xl overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 group transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#2a2a2a] transition-colors">
            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-sm font-medium">Back to List</span>
        </button>

        <CompareHeader data={data} colors={colors} />
        <BenchmarkChart data={data} colors={colors} />
        <PricingChart data={data} colors={colors} />
        <ModelSizeChart data={data} colors={colors} />
        <FeaturesCards data={data} colors={colors} />
        <InfoCards data={data} colors={colors} />
        <TakeawaysCards data={data} colors={colors} />
        <CompareTable data={data} colors={colors} />
        <SourcesList data={data} />

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-[#1a1a1a]">
          <p className="text-xs text-gray-600">
            Generated by AI Blog Studio · Data sourced from web search & HuggingFace
          </p>
        </div>
      </div>
    </div>
  );
}
