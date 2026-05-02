const fs = require('fs');
const path = require('path');

const WIKI_DIR = path.join(__dirname, '..', 'wiki-content');

function loadCategoriesConfig() {
  const raw = fs.readFileSync(path.join(WIKI_DIR, 'categories.json'), 'utf8');
  return JSON.parse(raw);
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[m[1]] = value;
  }
  return { data, body: match[2] };
}

function loadWikiArticle(categorySlug, articleSlug) {
  const file = path.join(WIKI_DIR, categorySlug, `${articleSlug}.md`);
  const text = fs.readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(text);
  return {
    title: data.title || articleSlug,
    description: data.description || '',
    body,
    categorySlug,
    articleSlug,
  };
}

function loadAllArticles(config) {
  const out = [];
  for (const category of config.categories) {
    for (const articleMeta of category.articles) {
      const article = loadWikiArticle(category.slug, articleMeta.slug);
      out.push({ category, articleMeta, article });
    }
  }
  return out;
}

module.exports = { loadCategoriesConfig, parseFrontmatter, loadWikiArticle, loadAllArticles };
