const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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

async function fetchMetadata(videoId) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.status}`);
  const data = await res.json();
  return {
    title: data.title,
    channel_name: data.author_name,
    thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  };
}

async function fetchTranscript(videoId) {
  // Method 1: Use YouTube's innertube API to get caption tracks
  const playerUrl = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
  const androidUA = 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)';

  const playerRes = await fetch(playerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': androidUA
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: '20.10.38'
        }
      },
      videoId
    })
  });

  let captionTracks;

  if (playerRes.ok) {
    const playerData = await playerRes.json();
    captionTracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  }

  // Method 2: Fallback to scraping the watch page
  if (!captionTracks || captionTracks.length === 0) {
    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    const html = await watchRes.text();

    if (html.includes('class="g-recaptcha"')) {
      throw new Error('YouTube is requiring CAPTCHA. Try again later.');
    }

    const match = html.match(/var ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
    if (!match) throw new Error('Could not find player response in page');

    try {
      const playerResponse = JSON.parse(match[1]);
      captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    } catch {
      throw new Error('Failed to parse player response');
    }
  }

  if (!captionTracks || captionTracks.length === 0) {
    throw new Error('No captions available for this video');
  }

  // Prefer English, fall back to first available
  const track = captionTracks.find(t => t.languageCode === 'en') || captionTracks[0];
  const trackUrl = track.baseUrl;

  // Verify the URL is from YouTube
  try {
    const parsed = new URL(trackUrl);
    if (!parsed.hostname.endsWith('.youtube.com')) {
      throw new Error('Invalid caption track URL');
    }
  } catch (e) {
    if (e.message === 'Invalid caption track URL') throw e;
    throw new Error('Invalid caption track URL');
  }

  const captionRes = await fetch(trackUrl, {
    headers: { 'User-Agent': USER_AGENT }
  });
  if (!captionRes.ok) throw new Error('Failed to fetch captions');

  const xml = await captionRes.text();
  const segments = parseTranscriptXml(xml, track.languageCode);

  // Build readable transcript with timestamps
  const lines = segments.map(seg => {
    const totalSeconds = Math.floor(seg.offset / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timestamp = `${minutes}:${String(seconds).padStart(2, '0')}`;
    return `[${timestamp}] ${seg.text}`;
  });

  return {
    segments,
    readable: lines.join('\n'),
    plain: segments.map(s => s.text).join(' ')
  };
}

function parseTranscriptXml(xml, lang) {
  const segments = [];

  // Try new format first: <p t="offset" d="duration"><s>text</s></p>
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = pRegex.exec(xml)) !== null) {
    const offset = parseInt(match[1], 10);
    const duration = parseInt(match[2], 10);
    const inner = match[3];

    // Extract text from <s> tags or use raw content
    let text = '';
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) text = inner.replace(/<[^>]+>/g, '');
    text = decodeEntities(text).trim();
    if (text) segments.push({ text, duration, offset, lang });
  }

  if (segments.length > 0) return segments;

  // Fallback: old format <text start="..." dur="...">text</text>
  const textRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
  while ((match = textRegex.exec(xml)) !== null) {
    segments.push({
      text: decodeEntities(match[3]).trim(),
      duration: Math.floor(parseFloat(match[2]) * 1000),
      offset: Math.floor(parseFloat(match[1]) * 1000),
      lang
    });
  }

  return segments;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node src/transcript.js <YouTube URL>');
    process.exit(1);
  }

  const videoId = extractVideoId(url);
  const [metadata, transcript] = await Promise.all([
    fetchMetadata(videoId),
    fetchTranscript(videoId)
  ]);

  const result = {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    ...metadata,
    transcript: transcript.readable,
    transcript_plain: transcript.plain
  };

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { extractVideoId, fetchMetadata, fetchTranscript };
