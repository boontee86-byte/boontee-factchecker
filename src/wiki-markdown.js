function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function rewriteWikiLink(href) {
  if (!href) return href;
  if (/^(https?:|mailto:|#)/i.test(href)) return href;
  const m = href.match(/^\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/i);
  if (m) return `/wiki/${m[1]}/${m[2]}.html`;
  return href;
}

function formatInlineWikiMarkdown(text) {
  // Stash backtick spans so their contents survive escapeHtml and later inline rules.
  // The placeholder uses only letters/digits so escapeHtml leaves it untouched
  // and no other rule matches it.
  const codeStash = [];
  let s = text.replace(/`([^`]+?)`/g, (_, code) => {
    const idx = codeStash.length;
    codeStash.push(code);
    return `WIKICODE${idx}ENDCODE`;
  });

  s = escapeHtml(s);

  // Images: ![alt](src) — runs before links because ! disambiguates the leading bracket.
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title) => {
    const safeSrc = src.replace(/"/g, '%22');
    const titleAttr = title ? ` title="${title}"` : '';
    return `<img class="article-img" src="${safeSrc}" alt="${alt}" loading="lazy"${titleAttr}>`;
  });

  // Links: [text](href)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const rewritten = rewriteWikiLink(href);
    const isExternal = /^https?:/i.test(rewritten);
    const attrs = isExternal ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${rewritten}"${attrs}>${label}</a>`;
  });

  // Bold then italic
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');

  // Restore code spans
  s = s.replace(/WIKICODE(\d+)ENDCODE/g, (_, idx) => `<code>${escapeHtml(codeStash[Number(idx)])}</code>`);

  return s;
}

function isTableSeparatorRow(line) {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

function formatWikiArticle(articleText, opts) {
  if (!articleText) return opts && opts.extractHeadings ? { html: '', headings: [] } : '';
  const lines = articleText.split('\n');
  const html = [];
  const headings = [];
  let listKind = null;
  let i = 0;

  function closeList() {
    if (listKind) {
      html.push(`</${listKind}>`);
      listKind = null;
    }
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      i++;
      continue;
    }

    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      closeList();
      html.push('<hr class="article-hr">');
      i++;
      continue;
    }

    // Tables: header row | sep | rows
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableSeparatorRow(lines[i + 1].trim())) {
      closeList();
      const header = splitTableRow(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t.startsWith('|')) break;
        rows.push(splitTableRow(t));
        i++;
      }
      const thead = `<thead><tr>${header.map(h => `<th>${formatInlineWikiMarkdown(h)}</th>`).join('')}</tr></thead>`;
      const tbody = `<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${formatInlineWikiMarkdown(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
      html.push(`<div class="article-table-wrap"><table class="article-table">${thead}${tbody}</table></div>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (listKind !== 'ul') { closeList(); html.push('<ul class="article-list">'); listKind = 'ul'; }
      html.push(`<li>${formatInlineWikiMarkdown(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listKind !== 'ol') { closeList(); html.push('<ol class="article-list-ol">'); listKind = 'ol'; }
      html.push(`<li>${formatInlineWikiMarkdown(trimmed.replace(/^\d+\.\s+/, ''))}</li>`);
      i++;
      continue;
    }

    closeList();

    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      const id = slugify(text);
      headings.push({ level: 3, text, id });
      html.push(`<h4 class="article-h3" id="${id}">${formatInlineWikiMarkdown(text)}</h4>`);
    } else if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      const id = slugify(text);
      headings.push({ level: 2, text, id });
      html.push(`<h3 class="article-h2" id="${id}">${formatInlineWikiMarkdown(text)}</h3>`);
    } else if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2);
      const id = slugify(text);
      headings.push({ level: 1, text, id });
      html.push(`<h3 class="article-h1" id="${id}">${formatInlineWikiMarkdown(text)}</h3>`);
    } else {
      html.push(`<p>${formatInlineWikiMarkdown(trimmed)}</p>`);
    }
    i++;
  }

  closeList();
  const result = html.join('\n      ');
  if (opts && opts.extractHeadings) return { html: result, headings };
  return result;
}

module.exports = { formatWikiArticle, formatInlineWikiMarkdown, rewriteWikiLink, escapeHtml, slugify };
