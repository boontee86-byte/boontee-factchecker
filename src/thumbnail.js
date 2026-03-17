const fs = require('fs');
const path = require('path');

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  throw new Error(`Could not extract video ID from: ${url}`);
}

async function downloadThumbnail(videoId) {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const outDir = path.join(__dirname, '..', 'site', 'thumbnails');
  const outPath = path.join(outDir, `${videoId}.jpg`);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const res = await fetch(thumbnailUrl);
  if (!res.ok) throw new Error(`Failed to download thumbnail: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  console.log(`Thumbnail saved to ${outPath}`);
  return outPath;
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node src/thumbnail.js <YouTube URL or video ID>');
    process.exit(1);
  }
  const videoId = extractVideoId(url);
  await downloadThumbnail(videoId);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { downloadThumbnail };
