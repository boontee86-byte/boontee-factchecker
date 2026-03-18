---
description: Research a financial topic and produce a comprehensive primer article
allowed-tools: Bash, Read, Write, WebSearch, WebFetch
---

Research the following financial topic and produce a comprehensive primer: $ARGUMENTS

Follow these steps precisely:

## Step 1: Generate Slug ID

Create a URL-friendly slug from the topic name. For example:
- "Private Debt" → "private-debt"
- "Venture Capital" → "venture-capital"
- "S&P 500 Index Funds" → "sp-500-index-funds"

Rules: lowercase, replace spaces with hyphens, remove special characters (ampersands, apostrophes, etc.), collapse multiple hyphens.

Remember this slug — you'll use it as the research ID.

## Step 2: Research the Topic

Use WebSearch extensively to gather comprehensive information about the topic. Search for:

- **Definitions and fundamentals** — What is it? How does it work?
- **Market data and statistics** — Current market size, historical growth, key metrics
- **Key players and structures** — Major firms, fund structures, deal types
- **Risk factors** — What are the risks? Historical losses, default rates
- **Performance data** — Historical returns, benchmarks, comparisons to other asset classes
- **Regulatory landscape** — Key regulations, recent changes
- **Current trends** — What's happening now? Recent developments
- **Academic and industry research** — Foundational papers, industry reports
- **Practical considerations** — How do investors access this? Minimum investments, liquidity

Do at least 8-12 searches to build a thorough understanding. Use primary sources:
- Industry reports (Preqin, PitchBook, McKinsey, Bain, BCG)
- Regulatory sources (SEC, Federal Reserve, BIS)
- Academic research and working papers
- Established financial journalism (WSJ, FT, Bloomberg, Reuters)
- Industry associations and standards bodies

## Step 3: Write the Primer Article

Write a comprehensive, publication-quality primer article (3,000-5,000+ words). This should be a standalone educational resource that gives readers a thorough understanding of the topic.

### Writing Rules

1. **Be comprehensive** — Cover all major aspects: definition, mechanics, market overview, risk/return profile, key players, regulatory environment, historical context, current trends, and practical considerations for investors.

2. **Structure with clear headings** — Use `## Heading` for major sections and `### Heading` for subsections. Create a logical flow from fundamentals to advanced topics.

3. **Use data and specifics** — Include concrete numbers, percentages, dates, and examples. Cite specific studies, reports, or data points discovered during research. Avoid vague generalities.

4. **Write in polished prose** — Professional, educational tone. No filler. Every paragraph should add value. Use markdown formatting: **bold** for key terms on first use, lists where appropriate.

5. **Contextualise** — Compare to related asset classes or concepts. Explain jargon when first introduced. Help readers understand where this fits in the broader financial landscape.

6. **Include structural scaffolding**:
   - An introduction that frames the topic and its significance
   - Clear section headings creating a scannable structure
   - Smooth transitions between sections
   - A conclusion that synthesises key points and looks ahead

7. **Stay factual** — Present verified information. Where data conflicts or is uncertain, note it. Do not inject personal opinions or investment advice.

8. **Use illustrations liberally** — Whenever you discuss breakdowns, distributions, market sizes, comparisons, or proportional data, include a visual chart illustration using the `:::chart` syntax. This produces a horizontal bar chart in the generated HTML. The syntax is:

   ```
   :::chart "Chart Title"
   Label 1|60|$1.5T (60%)
   Label 2|15|$375B (15%)
   Label 3|10|$250B (10%)
   :::
   ```

   Each row is: `Label|BarWidth|DisplayText`. The **BarWidth** is a number (0–100) that controls the bar length — it is NOT shown to readers. The **DisplayText** is what appears on the bar — this is what readers see, so make it meaningful (e.g. "$1.5T (60%)", "9.3% annualised", "$116.3B"). If DisplayText is omitted, the BarWidth is shown as-is. Always provide DisplayText for clarity.

   Use these charts for:
   - **Market size breakdowns** — e.g., sub-categories of a total market
   - **Investor type distributions** — e.g., who holds what percentage
   - **Return comparisons** — e.g., asset class returns side by side
   - **Geographic distributions** — e.g., regional market shares
   - **Any proportional data** that benefits from visual representation

   Aim for at least 3-5 charts per article. Every major section with quantitative data should have at least one chart.

### Quality Checklist

Before proceeding, verify:
- The article covers fundamentals through advanced topics
- Concrete data points and statistics are included throughout
- All jargon is explained on first use
- The article reads as a standalone educational resource
- Headings create a clear, scannable structure
- No filler or vague generalities remain
- Introduction and conclusion are present and substantive
- At least 3-5 `:::chart` illustrations are included for quantitative data

## Step 4: Write a Summary

Write a 2-3 sentence summary of the topic suitable for display on a card on the homepage. This should be concise and informative, giving readers a quick sense of what the primer covers.

## Step 5: Save Results

1. Write the full article content to `data/research_content_temp.txt`
2. Write a save script to `data/save_research_temp.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { initDb, saveResearch } = require('../src/db');
async function run() {
  await initDb();
  const content = fs.readFileSync(path.join(__dirname, 'research_content_temp.txt'), 'utf-8');
  await saveResearch('<SLUG_ID>', '<DISPLAY_TITLE>', '<SUMMARY_TEXT>', content);
}
run().then(() => console.log('Done')).catch(e => { console.error(e); process.exit(1); });
```

Replace `<SLUG_ID>`, `<DISPLAY_TITLE>`, and `<SUMMARY_TEXT>` with the actual values.

3. Run: `cd "/c/Users/User/Build YouTube-FactChecker" && node data/save_research_temp.js`
4. Clean up: `rm -f data/research_content_temp.txt data/save_research_temp.js`

## Step 6: Generate Site

```bash
cd "/c/Users/User/Build YouTube-FactChecker" && node src/generate-site.js
```

## Step 7: Commit and Push

Commit all changed files (database, site HTML) and push to the remote repository. This step must always happen at the end of every `/research` run without asking the user.

## Step 8: Report Summary

Display to the user:
- Topic title
- Number of sections in the primer
- Brief overview of what was covered
- Confirm the site has been regenerated
- Remind them to run `npm run dev` to see the updated site
