import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Convert HTML content to Markdown, stripping all hyperlinks (keeping link text only).
 */
function htmlToMarkdown(html) {
  let md = html;

  // Remove all <a> tags but keep inner text
  md = md.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold and italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Code blocks
  md = md.replace(/<pre[^>]*>\s*<code[^>]*class="language-(\w+)"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, '```$1\n$2\n```\n\n');
  md = md.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n');
  md = md.replace(/<\/?[ou]l[^>]*>/gi, '\n');

  // Paragraphs and line breaks
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, inner) => {
    const rows = [];
    const rowMatches = inner.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    rowMatches.forEach((row, idx) => {
      const cells = [];
      const cellMatches = row.match(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi) || [];
      cellMatches.forEach(cell => {
        const text = cell.replace(/<[^>]+>/g, '').trim();
        cells.push(text);
      });
      rows.push('| ' + cells.join(' | ') + ' |');
      if (idx === 0) {
        rows.push('| ' + cells.map(() => '---').join(' | ') + ' |');
      }
    });
    return rows.join('\n') + '\n\n';
  });

  // Remove remaining HTML tags (divs, spans, styles, etc.)
  md = md.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');

  // Clean up extra whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

/**
 * Strip all hyperlinks from HTML, keeping only the link text.
 * Uses DOM parser for reliable handling of nested/malformed tags.
 */
function stripLinks(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('a').forEach(a => {
    a.replaceWith(...a.childNodes);
  });
  return doc.body.innerHTML;
}

function cleanArticleContent(html) {
  const firstHtmlTag = html.search(/<(?:h[1-6]|p|div|section|article|main|header|ul|ol|table|figure|hr|br)\b/i);
  if (firstHtmlTag > 0) {
    return html.slice(firstHtmlTag);
  }
  return html;
}

/**
 * Extract unverified claims from QC_UNVERIFIED HTML comment.
 * Returns array of claim strings, or empty array if none found.
 */
function extractUnverifiedClaims(html) {
  const match = html.match(/<!--\s*QC_UNVERIFIED:\s*(\[[\s\S]*?\])\s*-->/);
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

/**
 * Strip QC_UNVERIFIED comment from HTML content.
 */
function stripQcComment(html) {
  return html.replace(/<!--\s*QC_UNVERIFIED:\s*\[[\s\S]*?\]\s*-->/g, '');
}

/**
 * Extract key numbers/phrases from a claim for fuzzy matching.
 * Returns an array of search tokens (numbers with optional units, key phrases).
 */
function extractClaimTokens(claim) {
  const tokens = [];
  // Extract numbers with optional units/suffixes (e.g., "70.4%", "128K", "3.5B", "$0.40")
  const numPattern = /\$?[\d]+[\d,.]*\s*[%KkMmBbGgTt]?\b/g;
  let m;
  while ((m = numPattern.exec(claim)) !== null) {
    tokens.push(m[0].trim());
  }
  return tokens;
}

/**
 * Check if an element's text content contains a claim's key tokens.
 */
function elementMatchesClaim(textContent, claim) {
  const tokens = extractClaimTokens(claim);
  if (tokens.length === 0) return false;
  // Require at least one numeric token to match
  return tokens.some(token => textContent.includes(token));
}

const WARNING_LABELS = {
  'EMPTY_RESULT': '文章输出为空',
  'NO_HF_CITATIONS': '文章无 HuggingFace 来源链接',
  'NO_NOVITA_CITATIONS': '文章无 Novita AI 来源链接',
};

function formatWarning(w) {
  const linkMatch = w.match(/^FEW_SOURCE_LINKS\((\d+)\)$/);
  if (linkMatch) return `来源链接过少 (仅${linkMatch[1]}个)`;
  const webMatch = w.match(/^FEW_WEB_SOURCES\((\d+)\)$/);
  if (webMatch) return `Web 来源过少 (仅${webMatch[1]}个非HF/Novita域名)`;
  const unverifiedMatch = w.match(/^UNVERIFIED_CLAIMS\((\d+)\)$/);
  if (unverifiedMatch) return null; // handled separately
  return WARNING_LABELS[w] || w;
}

export default function ArticleViewer({ article, onBack }) {
  const contentRef = useRef(null);
  const [unverifiedClaims, setUnverifiedClaims] = useState([]);

  const scrollToFirstMarker = useCallback(() => {
    if (!contentRef.current) return;
    const firstMarker = contentRef.current.querySelector('.qc-unverified-marker');
    if (firstMarker) {
      firstMarker.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    const claims = extractUnverifiedClaims(article.content);
    setUnverifiedClaims(claims);

    const cleanHtml = stripQcComment(cleanArticleContent(article.content));
    contentRef.current.innerHTML = cleanHtml;

    if (claims.length === 0) return;

    // Find paragraphs and table cells that contain unverified claim data
    const searchable = contentRef.current.querySelectorAll('p, td, th, li');
    const markedElements = new Set();

    for (const claim of claims) {
      for (const el of searchable) {
        if (markedElements.has(el)) continue;
        if (elementMatchesClaim(el.textContent, claim)) {
          markedElements.add(el);
          // Insert warning marker
          const marker = document.createElement('span');
          marker.className = 'qc-unverified-marker';
          marker.title = `未核实: ${claim}`;
          marker.textContent = '\u26A0';
          marker.style.cssText = 'display:inline-block;margin-left:4px;padding:1px 5px;font-size:12px;background:#fef3c7;color:#d97706;border:1px solid #fbbf24;border-radius:4px;cursor:help;vertical-align:middle;';
          // For table cells, insert at beginning; for others, append
          if (el.tagName === 'TD' || el.tagName === 'TH') {
            el.insertBefore(marker, el.firstChild);
          } else {
            el.appendChild(marker);
          }
          break; // each claim marks at most one element
        }
      }
    }
  }, [article.content]);

  // Separate UNVERIFIED_CLAIMS warning from other warnings
  const warningParts = article.warnings ? article.warnings.split(',') : [];
  const unverifiedWarning = warningParts.find(w => w.startsWith('UNVERIFIED_CLAIMS('));
  const otherWarnings = warningParts.filter(w => !w.startsWith('UNVERIFIED_CLAIMS(')).map(formatWarning).filter(Boolean);

  return (
    <div className="card overflow-hidden">
      {/* Article header */}
      <div className="px-8 py-8 border-b border-dark-200">
        <button
          onClick={onBack}
          className="flex items-center text-dark-500 hover:text-dark-900 mb-6 group transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center mr-2 group-hover:bg-dark-200 transition-colors">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="font-medium">Back to List</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1 pr-6">
            <h1 className="text-4xl font-display font-black text-dark-900 leading-tight mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-medium">Model</div>
                  <div className="text-dark-900 font-semibold">{article.modelName}</div>
                </div>
              </div>

              <div className="w-px h-10 bg-dark-200"></div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-medium">Keyword</div>
                  <div className="text-dark-900 font-semibold">{article.keyword}</div>
                </div>
              </div>

              <div className="w-px h-10 bg-dark-200"></div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-dark-400 font-medium">Created</div>
                  <div className="text-dark-900 font-semibold">{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => {
                const blob = new Blob([stripLinks(cleanArticleContent(article.content))], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${article.title}.html`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn btn-secondary group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export HTML
            </button>
            <button
              onClick={() => {
                const markdown = htmlToMarkdown(cleanArticleContent(article.content));
                const blob = new Blob([markdown], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${article.title}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn btn-primary group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Markdown
            </button>
          </div>
        </div>
      </div>

      {/* Search diagnostics warnings */}
      {(otherWarnings.length > 0 || unverifiedWarning) && (
        <div className="mx-8 mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <div className="text-sm font-medium text-amber-700">搜索诊断警告</div>
          <div className="text-xs text-amber-600 mt-1 flex flex-wrap items-center gap-1">
            {otherWarnings.length > 0 && <span>{otherWarnings.join(' | ')}</span>}
            {otherWarnings.length > 0 && unverifiedWarning && <span> | </span>}
            {unverifiedWarning && (
              <button
                onClick={scrollToFirstMarker}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-800 font-medium cursor-pointer transition-colors"
              >
                <span>{'\u26A0'}</span>
                <span>未核实数据 ({unverifiedClaims.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Article content */}
      <div className="px-8 py-8">
        <div
          ref={contentRef}
          className="prose max-w-none"
        />
      </div>
    </div>
  );
}
