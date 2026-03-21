const fs = require('fs');
const path = require('path');
const { listVideos, getVideo, listResearch, getResearch } = require('./db');

const SITE_DIR = path.join(__dirname, '..', 'docs');

function verdictClass(verdict) {
  return (verdict || '').toLowerCase().replace(/\s+/g, '-');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function htmlHead(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="stylesheet" href="/css/style.css?v=${Date.now()}">
  <script>document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'</script>
</head>
<body>
  <button class="theme-toggle theme-toggle-fixed" onclick="toggleTheme()" aria-label="Toggle theme"></button>`;
}

function htmlFooter() {
  return `
  <footer class="site-footer">
    <div class="container">
      Created by <a href="https://www.youtube.com/@BoonTee" target="_blank">BoonTee</a>
      &middot;
      <a href="https://t.me/boontee86" target="_blank">Suggest a video on Telegram</a>
    </div>
  </footer>
  <script>
    function toggleTheme() {
      var t = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
      localStorage.setItem('theme', t);
      updateToggleLabel();
    }
    function updateToggleLabel() {
      var btn = document.querySelector('.theme-toggle');
      if (btn) btn.textContent = document.documentElement.dataset.theme === 'light' ? '[ dark ]' : '[ light ]';
    }
    updateToggleLabel();
  </script>
</body>
</html>`;
}

function generateIndex(videos, researchItems) {
  const videoCards = videos.map(v => `
      <div class="video-card">
        <a href="/video/${v.id}.html">
          <img class="thumbnail" src="/thumbnails/${v.id}.jpg" alt="${escapeHtml(v.title)}" loading="lazy">
          <div class="card-body">
            <div class="card-title">${escapeHtml(v.title)}</div>
            <div class="card-meta">${escapeHtml(v.channel_name)} &middot; ${v.published_date ? formatDate(v.published_date) : formatDate(v.fact_checked_at)}</div>
            <span class="verdict-badge ${verdictClass(v.overall_verdict)}">${escapeHtml(v.overall_verdict)}</span>
          </div>
        </a>
      </div>`).join('\n');

  const emptyState = videos.length === 0
    ? '<div class="empty-state">No videos fact-checked yet. Check back soon.</div>'
    : '';

  return `${htmlHead('BoonTee Insights — Finance & Investing')}
  <header class="site-header">
    <div class="container">
      <h1>BoonTee Insights</h1>
      <div class="subtitle">Finance & investing analysis, fact-checks, and research</div>
    </div>
  </header>

  <main class="container">
    <div class="intro">
      <p>I'm <a href="https://www.youtube.com/@BoonTee" target="_blank">BoonTee</a>, a finance content creator sharing insights on markets, investing, and financial literacy. This site is where I publish my work — from fact-checking popular YouTube finance videos to deep-dive research on topics that matter to investors.</p>
      <p>Have a video you'd like me to fact-check or a topic you'd like explored? <a href="https://t.me/boontee86" target="_blank">Reach out on Telegram</a>.</p>
    </div>

    <div class="section-divider"></div>
    <h2 class="section-header">Fact-Checks</h2>
    <p class="section-description">Claims in YouTube finance and investing videos, verified against primary sources including SEC filings, Federal Reserve data, and established financial research.</p>
    <div class="video-grid">
${videoCards}
    </div>
    ${emptyState}

    ${researchItems && researchItems.length > 0 ? `
    <div class="section-divider"></div>
    <h2 class="section-header">Research</h2>
    <p class="section-description">AI-assisted deep dives into financial topics — primers designed to help you understand the forces shaping markets.</p>
    <div class="research-grid">
      ${researchItems.map(r => {
        const thumbExt = ['png', 'jpg', 'webp'].find(ext => fs.existsSync(path.join(SITE_DIR, 'thumbnails', `${r.id}.${ext}`)));
        const thumbHtml = thumbExt ? `<img class="research-card-thumbnail" src="/thumbnails/${r.id}.${thumbExt}" alt="${escapeHtml(r.title)}" loading="lazy">` : '';
        return `
      <div class="research-card">
        <a href="/research/${r.id}.html">
          ${thumbHtml}
          <div class="research-card-body">
            <div class="research-card-title">${escapeHtml(r.title)}</div>
            <div class="research-card-summary">${escapeHtml(r.summary)}</div>
            <div class="research-card-date">${formatDate(r.created_at)}</div>
          </div>
        </a>
      </div>`;
      }).join('\n')}
    </div>` : ''}
  </main>

${htmlFooter()}`;
}

function parseTimestampToSeconds(ts) {
  if (!ts) return Infinity;
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return Infinity;
}

function formatTranscript(rawTranscript) {
  if (!rawTranscript) return '';
  const lines = rawTranscript.split('\n').filter(l => l.trim());
  const paragraphs = [];
  let currentTexts = [];
  let paragraphStartTimestamp = '';
  let paragraphStartSecs = 0;

  for (const line of lines) {
    const match = line.match(/^\[(\d+:\d{2})\]\s*(.*)/);
    if (!match) {
      if (line.trim()) currentTexts.push(line.trim());
      continue;
    }
    const timestamp = match[1];
    const text = match[2].trim();
    if (!text) continue;

    const currentSecs = parseTimestampToSeconds(timestamp);

    // Start a new paragraph every ~60 seconds from the paragraph's start
    if (currentTexts.length > 0 && (currentSecs - paragraphStartSecs) >= 60) {
      paragraphs.push({ timestamp: paragraphStartTimestamp, text: currentTexts.join(' ') });
      currentTexts = [];
      paragraphStartTimestamp = timestamp;
      paragraphStartSecs = currentSecs;
    }

    if (currentTexts.length === 0) {
      paragraphStartTimestamp = timestamp;
      paragraphStartSecs = currentSecs;
    }

    currentTexts.push(text);
  }
  if (currentTexts.length > 0) {
    paragraphs.push({ timestamp: paragraphStartTimestamp, text: currentTexts.join(' ') });
  }

  return paragraphs.map(p => {
    return `<p><span class="transcript-timestamp">[${escapeHtml(p.timestamp)}]</span> ${escapeHtml(p.text)}</p>`;
  }).join('\n      ');
}

function formatInlineMarkdown(text) {
  let s = escapeHtml(text);
  // Bold: **text** or __text__
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic: *text* or _text_ (but not inside words for underscores)
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return s;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatArticle(articleText, opts) {
  if (!articleText) return opts && opts.extractHeadings ? { html: '', headings: [] } : '';
  const lines = articleText.split('\n');
  const html = [];
  const headings = [];
  let inList = false;
  let inChart = false;
  let chartTitle = '';
  let chartRows = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Chart block: :::chart "Title"
    if (trimmed.startsWith(':::chart')) {
      if (!inChart) {
        inChart = true;
        chartTitle = (trimmed.match(/:::chart\s+"(.+?)"/) || [])[1] || '';
        chartRows = [];
        continue;
      } else {
        // Closing :::
        if (inList) { html.push('</ul>'); inList = false; }
        html.push(renderChart(chartTitle, chartRows));
        inChart = false;
        chartTitle = '';
        chartRows = [];
        continue;
      }
    }
    if (trimmed === ':::' && inChart) {
      if (inList) { html.push('</ul>'); inList = false; }
      html.push(renderChart(chartTitle, chartRows));
      inChart = false;
      chartTitle = '';
      chartRows = [];
      continue;
    }
    if (inChart) {
      // Parse chart row: Label|Percentage|Detail (detail is optional)
      const parts = trimmed.split('|').map(s => s.trim());
      if (parts.length >= 2) {
        chartRows.push({ label: parts[0], pct: parts[1], detail: parts[2] || '' });
      }
      continue;
    }

    if (!trimmed) {
      if (inList) { html.push('</ul>'); inList = false; }
      continue;
    }

    // List items: lines starting with - or *
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) { html.push('<ul class="article-list">'); inList = true; }
      html.push(`<li>${formatInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    if (inList) { html.push('</ul>'); inList = false; }

    // Heading patterns: lines starting with ## or ### or # become headings
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      const id = slugify(text);
      headings.push({ level: 3, text, id });
      html.push(`<h4 class="article-h3" id="${id}">${formatInlineMarkdown(text)}</h4>`);
    } else if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      const id = slugify(text);
      headings.push({ level: 2, text, id });
      html.push(`<h3 class="article-h2" id="${id}">${formatInlineMarkdown(text)}</h3>`);
    } else if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2);
      const id = slugify(text);
      headings.push({ level: 1, text, id });
      html.push(`<h3 class="article-h1" id="${id}">${formatInlineMarkdown(text)}</h3>`);
    } else {
      html.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
    }
  }

  if (inList) html.push('</ul>');
  const result = html.join('\n      ');
  if (opts && opts.extractHeadings) {
    return { html: result, headings };
  }
  return result;
}

function renderChart(title, rows) {
  if (!rows.length) return '';
  // Parse percentages for bar widths
  const maxPct = Math.max(...rows.map(r => parseFloat(r.pct) || 0), 1);
  const barsHtml = rows.map(r => {
    const pctNum = parseFloat(r.pct) || 0;
    const widthPct = Math.max((pctNum / maxPct) * 100, 2);
    return `<div class="chart-row">
        <div class="chart-label">${escapeHtml(r.label)}</div>
        <div class="chart-bar-container">
          <div class="chart-bar" style="width: ${widthPct}%">
            <span class="chart-bar-text">${r.detail ? escapeHtml(r.detail) : escapeHtml(r.pct)}</span>
          </div>
        </div>
      </div>`;
  }).join('\n');
  return `<div class="article-chart">
      ${title ? `<div class="chart-title">${escapeHtml(title)}</div>` : ''}
      ${barsHtml}
    </div>`;
}

function generateVideoPage(video) {
  // Sort claims by timestamp
  const sortedClaims = (video.claims || []).slice().sort((a, b) => {
    return parseTimestampToSeconds(a.timestamp_in_video) - parseTimestampToSeconds(b.timestamp_in_video);
  });

  const claimCards = sortedClaims.map((claim, i) => {
    const sources = (Array.isArray(claim.sources) ? claim.sources : [])
      .map(s => `<a href="${escapeHtml(s)}" target="_blank">${escapeHtml(s)}</a>`)
      .join('');

    return `
      <div class="claim-card">
        ${claim.timestamp_in_video ? `<div class="claim-timestamp">${escapeHtml(claim.timestamp_in_video)}</div>` : ''}
        <div class="claim-text">"${escapeHtml(claim.claim_text)}"</div>
        <div class="claim-verdict">
          <span class="verdict-badge ${verdictClass(claim.verdict)}">${escapeHtml(claim.verdict)}</span>
        </div>
        <div class="claim-evidence">${escapeHtml(claim.evidence)}</div>
        ${sources ? `<div class="claim-sources">${sources}</div>` : ''}
        ${claim.notes ? `<div class="claim-notes">${escapeHtml(claim.notes)}</div>` : ''}
      </div>`;
  }).join('\n');

  const summaryParagraphs = (video.overall_summary || '')
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('\n      ');

  return `${htmlHead(`${video.title} — Fact Check`)}
  <main class="container">
    <a href="/" class="back-link">&larr; Back to all videos</a>

    <div class="video-detail-header">
      <h1>${escapeHtml(video.title)}</h1>
      <div class="meta">${escapeHtml(video.channel_name)} &middot; Checked ${formatDate(video.fact_checked_at)}</div>
    </div>

    <iframe class="video-embed" src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>

    <div class="overall-verdict">
      <div class="verdict-label">Overall Verdict</div>
      <span class="verdict-badge ${verdictClass(video.overall_verdict)}">${escapeHtml(video.overall_verdict)}</span>
    </div>

    <div class="summary">
      <h2>Summary</h2>
      ${summaryParagraphs}
    </div>

    <div class="claims-section">
      <h2>Claims Analyzed (${video.claims ? video.claims.length : 0})</h2>
      ${claimCards}
    </div>

    ${video.source_quality_note ? `
    <div class="source-quality">
      <h2>Source Quality</h2>
      <p>${escapeHtml(video.source_quality_note)}</p>
    </div>` : ''}

    <div class="transcript-section">
      <h2>Transcript</h2>
      ${video.transcript_article ? `
      <div class="transcript-article">
        ${formatArticle(video.transcript_article)}
      </div>
      <details class="raw-transcript-toggle">
        <summary>Show raw transcript with timestamps</summary>
        <div class="raw-transcript">
          ${formatTranscript(video.transcript_readable || video.transcript_text)}
        </div>
      </details>
      ` : formatTranscript(video.transcript_readable || video.transcript_text)}
    </div>

    <div class="fact-check-timestamp">
      Fact-checked on ${formatDate(video.fact_checked_at)}
    </div>
  </main>

${htmlFooter()}`;
}

function buildToc(headings) {
  if (!headings || headings.length === 0) return '';
  const items = headings
    .filter(h => h.level <= 2) // Only ## headings in the TOC (major sections)
    .map(h => `<li class="toc-item"><a href="#${h.id}" class="toc-link">${escapeHtml(h.text)}</a></li>`)
    .join('\n          ');
  return `<nav class="research-toc" aria-label="Table of contents">
        <div class="toc-title">Contents</div>
        <ol class="toc-list">
          ${items}
        </ol>
      </nav>`;
}

function generateResearchPage(research) {
  const { html: articleHtml, headings } = formatArticle(research.content, { extractHeadings: true });
  const toc = buildToc(headings);
  const thumbExt = ['png', 'jpg', 'webp'].find(ext => fs.existsSync(path.join(SITE_DIR, 'thumbnails', `${research.id}.${ext}`)));
  const heroHtml = thumbExt ? `\n    <img class="research-hero" src="/thumbnails/${research.id}.${thumbExt}" alt="${escapeHtml(research.title)}">` : '';

  return `${htmlHead(`${research.title} — Research Primer`)}
  <main class="container research-container">
    <a href="/" class="back-link">&larr; Back to home</a>
    ${heroHtml}
    <div class="research-detail-header">
      <h1>${escapeHtml(research.title)}</h1>
      <div class="meta">Research Primer &middot; ${formatDate(research.created_at)}</div>
    </div>

    <div class="research-layout">
      ${toc}
      <div class="research-article transcript-article">
        ${articleHtml}
      </div>
    </div>

    <div class="fact-check-timestamp">
      Published ${formatDate(research.created_at)}
    </div>
  </main>

  <script>
    // Highlight active TOC item on scroll
    (function() {
      var toc = document.querySelector('.research-toc');
      if (!toc) return;
      var links = toc.querySelectorAll('.toc-link');
      var ids = Array.prototype.map.call(links, function(a) { return a.getAttribute('href').slice(1); });
      function onScroll() {
        var scrollY = window.scrollY || window.pageYOffset;
        var active = '';
        for (var i = 0; i < ids.length; i++) {
          var el = document.getElementById(ids[i]);
          if (el && el.offsetTop <= scrollY + 120) active = ids[i];
        }
        links.forEach(function(a) {
          a.classList.toggle('toc-active', a.getAttribute('href') === '#' + active);
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();
  </script>

${htmlFooter()}`;
}

async function main() {
  const videos = await listVideos();
  const researchItems = await listResearch();

  // Generate index page
  const indexHtml = generateIndex(videos, researchItems);
  fs.writeFileSync(path.join(SITE_DIR, 'index.html'), indexHtml);
  console.log(`Generated index.html (${videos.length} videos, ${researchItems.length} research articles)`);

  // Generate individual video pages
  const videoDir = path.join(SITE_DIR, 'video');
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  for (const v of videos) {
    const fullVideo = await getVideo(v.id);
    if (!fullVideo) continue;
    const videoHtml = generateVideoPage(fullVideo);
    fs.writeFileSync(path.join(videoDir, `${v.id}.html`), videoHtml);
    console.log(`Generated video/${v.id}.html`);
  }

  // Generate individual research pages
  const researchDir = path.join(SITE_DIR, 'research');
  if (!fs.existsSync(researchDir)) fs.mkdirSync(researchDir, { recursive: true });

  for (const r of researchItems) {
    const fullResearch = await getResearch(r.id);
    if (!fullResearch) continue;
    const researchHtml = generateResearchPage(fullResearch);
    fs.writeFileSync(path.join(researchDir, `${r.id}.html`), researchHtml);
    console.log(`Generated research/${r.id}.html`);
  }

  console.log('Site generation complete.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
