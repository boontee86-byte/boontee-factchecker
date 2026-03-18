const fs = require('fs');
const path = require('path');
const { listVideos, getVideo, listResearch, getResearch } = require('./db');

const SITE_DIR = path.join(__dirname, '..', 'site');

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

  return `${htmlHead('YouTube Fact-Checker — Finance & Investing')}
  <header class="site-header">
    <div class="container">
      <h1>YouTube Fact-Checker</h1>
      <div class="subtitle">Verifying claims in finance & investing videos</div>
    </div>
  </header>

  <main class="container">
    <div class="intro">
      <p>This site fact-checks claims made in YouTube finance and investing videos. Each video's transcript is analyzed, and key financial claims are verified against primary sources including SEC filings, Federal Reserve data, and established financial research.</p>
      <p>I'm <a href="https://www.youtube.com/@BoonTee" target="_blank">BoonTee</a>, a finance content creator. I built this to promote accuracy in the financial content space. Want to suggest a video for fact-checking? <a href="https://t.me/boontee86" target="_blank">Reach out on Telegram</a>.</p>
    </div>

    <div class="video-grid">
${videoCards}
    </div>
    ${emptyState}

    ${researchItems && researchItems.length > 0 ? `
    <div class="section-divider"></div>
    <h2 class="section-header">Research</h2>
    <div class="research-grid">
      ${researchItems.map(r => `
      <div class="research-card">
        <a href="/research/${r.id}.html">
          <div class="research-card-body">
            <div class="research-card-title">${escapeHtml(r.title)}</div>
            <div class="research-card-summary">${escapeHtml(r.summary)}</div>
            <div class="research-card-date">${formatDate(r.created_at)}</div>
          </div>
        </a>
      </div>`).join('\n')}
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

function formatArticle(articleText) {
  if (!articleText) return '';
  const lines = articleText.split('\n');
  const html = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
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
      html.push(`<h4 class="article-h3">${formatInlineMarkdown(trimmed.slice(4))}</h4>`);
    } else if (trimmed.startsWith('## ')) {
      html.push(`<h3 class="article-h2">${formatInlineMarkdown(trimmed.slice(3))}</h3>`);
    } else if (trimmed.startsWith('# ')) {
      html.push(`<h3 class="article-h1">${formatInlineMarkdown(trimmed.slice(2))}</h3>`);
    } else {
      html.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
    }
  }

  if (inList) html.push('</ul>');
  return html.join('\n      ');
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

function generateResearchPage(research) {
  return `${htmlHead(`${research.title} — Research Primer`)}
  <main class="container">
    <a href="/" class="back-link">&larr; Back to home</a>

    <div class="research-detail-header">
      <h1>${escapeHtml(research.title)}</h1>
      <div class="meta">Research Primer &middot; ${formatDate(research.created_at)}</div>
    </div>

    <div class="research-article transcript-article">
      ${formatArticle(research.content)}
    </div>

    <div class="fact-check-timestamp">
      Published ${formatDate(research.created_at)}
    </div>
  </main>

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
