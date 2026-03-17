---
description: Fact-check a YouTube video by fetching its transcript and analyzing claims
allowed-tools: Bash, Read, Write, WebSearch, WebFetch
---

Fact-check the YouTube video at: $ARGUMENTS

Follow these steps precisely:

## Step 1: Fetch Transcript and Metadata

Run this command to get the video transcript and metadata:

```bash
cd "/c/Users/User/Build YouTube-FactChecker" && node src/transcript.js "$ARGUMENTS"
```

Read the output carefully. It contains the video title, channel name, and full transcript.

## Step 2: Analyze the Transcript

Read through the entire transcript. This is a finance and investing fact-checker. Identify every significant factual claim, including:

- **Financial data claims**: specific returns, percentages, market cap, revenue figures, price targets
- **Historical claims**: dates, events, historical performance data
- **Statistical claims**: studies cited, survey results, economic data
- **Attribution claims**: quotes attributed to people, analyst ratings, company statements
- **Regulatory/legal claims**: SEC rules, tax rates, legal requirements mentioned

Skip pure opinions, predictions about the future, and general commentary that doesn't assert verifiable facts.

## Step 3: Verify Each Claim

For each factual claim identified, use WebSearch to verify it. Search for:
- Primary financial data sources (SEC EDGAR filings, Federal Reserve FRED data, Bureau of Labor Statistics)
- Established financial data providers (Yahoo Finance, Bloomberg, Morningstar, S&P Global)
- Official company reports (10-K, 10-Q, earnings transcripts)
- Academic sources and peer-reviewed research
- Reputable financial journalism (WSJ, FT, Reuters, Bloomberg)

Be thorough but efficient. For straightforward claims (e.g., "Apple's market cap is $3T"), a single search may suffice. For complex claims, do multiple searches.

## Step 4: Produce the Fact-Check Result

After verification, create the result JSON. Use these verdict values:

| Verdict | When to use |
|---------|-------------|
| TRUE | Fully verified by credible sources |
| MOSTLY TRUE | Accurate with minor caveats or imprecisions |
| MISLEADING | Technically has a basis but missing critical context |
| MIXED | Contains both accurate and inaccurate elements |
| UNVERIFIABLE | Cannot find credible sources to confirm or deny |
| MOSTLY FALSE | Contains significant inaccuracies |
| FALSE | Directly contradicted by credible sources |

Now save the result. The best approach for long transcripts is to write temporary files and use a save script:

1. Write the result JSON to `data/result_temp.json`
2. Write the plain transcript to `data/transcript_temp.txt`
3. Write the readable transcript (with timestamps) to `data/transcript_readable_temp.txt`
4. Write a save script to `data/save_temp.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { initDb, saveResult } = require('../src/db');
async function run() {
  await initDb();
  const metadata = { title: '<VIDEO TITLE>', channel_name: '<CHANNEL NAME>' };
  const result = JSON.parse(fs.readFileSync(path.join(__dirname, 'result_temp.json'), 'utf-8'));
  const transcript = fs.readFileSync(path.join(__dirname, 'transcript_temp.txt'), 'utf-8');
  const transcriptReadable = fs.readFileSync(path.join(__dirname, 'transcript_readable_temp.txt'), 'utf-8');
  await saveResult('<VIDEO_URL>', '<VIDEO_ID>', metadata, transcript, result, transcriptReadable);
}
run().then(() => console.log('Done')).catch(e => { console.error(e); process.exit(1); });
```

5. Run: `cd "/c/Users/User/Build YouTube-FactChecker" && node data/save_temp.js`
6. Clean up: `rm -f data/result_temp.json data/transcript_temp.txt data/transcript_readable_temp.txt data/save_temp.js`

For the result JSON, use the following structure:

```json
{
  "overall_verdict": "VERDICT",
  "overall_summary": "2-3 paragraph summary",
  "source_quality_note": "Assessment of sources cited in the video",
  "claims": [
    {
      "claim_text": "The exact claim or close paraphrase",
      "timestamp_in_video": "M:SS",
      "verdict": "VERDICT",
      "evidence": "What was found during verification",
      "sources": ["https://..."],
      "notes": "Additional context if needed"
    }
  ]
}
```

IMPORTANT: Order claims chronologically by their timestamp_in_video (earliest first). The site will also sort them, but providing them in order makes the JSON easier to review.

## Step 5: Download Thumbnail and Build Site

```bash
cd "/c/Users/User/Build YouTube-FactChecker" && node src/thumbnail.js "$ARGUMENTS"
cd "/c/Users/User/Build YouTube-FactChecker" && node src/generate-site.js
```

## Step 6: Report Summary

Display to the user:
- Video title and channel
- Overall verdict
- Number of claims checked
- A brief summary of key findings
- Confirm the site has been regenerated
- Remind them to run `npm run dev` to see the updated site
