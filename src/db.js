const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'factchecker.db');

async function getDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    return new SQL.Database(buffer);
  }
  return new SQL.Database();
}

function saveDb(db) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDb() {
  const db = await getDb();
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      thumbnail_path TEXT,
      transcript_text TEXT NOT NULL,
      transcript_readable TEXT,
      overall_verdict TEXT NOT NULL,
      overall_summary TEXT NOT NULL,
      source_quality_note TEXT,
      fact_checked_at TEXT NOT NULL,
      video_duration_seconds INTEGER,
      language TEXT DEFAULT 'en'
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id TEXT NOT NULL REFERENCES videos(id),
      claim_text TEXT NOT NULL,
      timestamp_in_video TEXT,
      verdict TEXT NOT NULL,
      evidence TEXT NOT NULL,
      sources TEXT,
      notes TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_claims_video ON claims(video_id)`);
  saveDb(db);
  db.close();
  console.log('Database initialized at', DB_PATH);
}

async function saveResult(videoUrl, videoId, metadata, transcriptText, result, transcriptReadable) {
  const db = await getDb();

  // Delete existing data for this video (allow re-checking)
  db.run('DELETE FROM claims WHERE video_id = ?', [videoId]);
  db.run('DELETE FROM videos WHERE id = ?', [videoId]);

  db.run(`
    INSERT INTO videos (id, url, title, channel_name, thumbnail_path, transcript_text,
      transcript_readable, overall_verdict, overall_summary, source_quality_note, fact_checked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    videoId,
    videoUrl,
    metadata.title,
    metadata.channel_name,
    `thumbnails/${videoId}.jpg`,
    transcriptText,
    transcriptReadable || '',
    result.overall_verdict,
    result.overall_summary,
    result.source_quality_note || '',
    new Date().toISOString()
  ]);

  const claims = result.claims || [];
  claims.forEach((claim, i) => {
    db.run(`
      INSERT INTO claims (video_id, claim_text, timestamp_in_video, verdict, evidence, sources, notes, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      videoId,
      claim.claim_text,
      claim.timestamp_in_video || '',
      claim.verdict,
      claim.evidence,
      JSON.stringify(claim.sources || []),
      claim.notes || '',
      i
    ]);
  });

  saveDb(db);
  db.close();
  console.log(`Saved fact-check for "${metadata.title}" (${videoId})`);
}

async function listVideos() {
  const db = await getDb();
  const rows = db.exec('SELECT id, url, title, channel_name, thumbnail_path, overall_verdict, overall_summary, fact_checked_at FROM videos ORDER BY fact_checked_at DESC');
  db.close();
  if (!rows.length || !rows[0].values.length) return [];
  return rows[0].values.map(row => ({
    id: row[0], url: row[1], title: row[2], channel_name: row[3],
    thumbnail_path: row[4], overall_verdict: row[5], overall_summary: row[6],
    fact_checked_at: row[7]
  }));
}

async function getVideo(videoId) {
  const db = await getDb();
  const videoRows = db.exec('SELECT * FROM videos WHERE id = ?', [videoId]);
  if (!videoRows.length || !videoRows[0].values.length) {
    db.close();
    return null;
  }
  const cols = videoRows[0].columns;
  const vals = videoRows[0].values[0];
  const video = {};
  cols.forEach((col, i) => video[col] = vals[i]);

  const claimRows = db.exec('SELECT * FROM claims WHERE video_id = ? ORDER BY sort_order', [videoId]);
  video.claims = [];
  if (claimRows.length && claimRows[0].values.length) {
    const claimCols = claimRows[0].columns;
    video.claims = claimRows[0].values.map(row => {
      const claim = {};
      claimCols.forEach((col, i) => claim[col] = row[i]);
      try { claim.sources = JSON.parse(claim.sources || '[]'); } catch { claim.sources = []; }
      return claim;
    });
  }

  db.close();
  return video;
}

// CLI interface
async function main() {
  const command = process.argv[2];

  if (command === 'init') {
    await initDb();
  } else if (command === 'save') {
    // Called from the skill: node src/db.js save <videoUrl> <videoId> <metadataJson> <transcriptText> <resultJson>
    const videoUrl = process.argv[3];
    const videoId = process.argv[4];
    const metadata = JSON.parse(process.argv[5]);
    const transcriptText = process.argv[6];
    const result = JSON.parse(process.argv[7]);
    await saveResult(videoUrl, videoId, metadata, transcriptText, result);
  } else if (command === 'list') {
    const videos = await listVideos();
    console.log(JSON.stringify(videos, null, 2));
  } else if (command === 'get') {
    const video = await getVideo(process.argv[3]);
    console.log(JSON.stringify(video, null, 2));
  } else {
    console.log('Usage: node src/db.js <init|save|list|get>');
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { getDb, saveDb, initDb, saveResult, listVideos, getVideo };
