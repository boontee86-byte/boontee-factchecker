---
description: Transcribe a YouTube video by downloading its audio and running Whisper, with optional translation to English
allowed-tools: Bash, Read, Write
---

Transcribe the YouTube video at: $ARGUMENTS

Follow these steps precisely:

## Step 1: Ask for Language

Ask the user: "What language is spoken in this YouTube video? (e.g. English, Malay, Mandarin, Japanese, Spanish, etc.)"

Wait for the user's response before continuing. Store the language name for use in subsequent steps.

## Step 2: Download Audio

Create the output directory if it doesn't exist and download the audio as MP3:

```bash
mkdir -p "/c/Users/User/Build YouTube-FactChecker/data/transcribe" && \
cd "/c/Users/User/Build YouTube-FactChecker/data/transcribe" && \
yt-dlp -x --audio-format mp3 --audio-quality 0 -o "audio.%(ext)s" "$ARGUMENTS" && \
ls -lh audio.mp3
```

If yt-dlp is not installed, tell the user to run: `pip install yt-dlp`

## Step 3: Transcribe with Whisper

Map the user's language to its Whisper language code (e.g. "English" → "en", "Malay" → "ms", "Mandarin" / "Chinese" → "zh", "Japanese" → "ja", "Spanish" → "es", "French" → "fr", "Arabic" → "ar", "Hindi" → "hi", "Korean" → "ko", "Thai" → "th", "Indonesian" → "id", "Vietnamese" → "vi", "Tamil" → "ta", etc.)

Run Whisper with the `large-v3` model (fall back to `medium` if large-v3 is unavailable) using the `--word_timestamps True` flag for precision. Use the `--output_format txt` and `--output_format json` flags to produce both outputs:

```bash
cd "/c/Users/User/Build YouTube-FactChecker/data/transcribe" && \
whisper audio.mp3 \
  --model large-v3 \
  --language <LANGUAGE_CODE> \
  --task transcribe \
  --word_timestamps True \
  --output_format all \
  --output_dir . 2>&1 | tail -20
```

If Whisper is not installed, tell the user to run: `pip install openai-whisper`

If the `large-v3` model fails or is too slow, retry with `medium`:

```bash
cd "/c/Users/User/Build YouTube-FactChecker/data/transcribe" && \
whisper audio.mp3 \
  --model medium \
  --language <LANGUAGE_CODE> \
  --task transcribe \
  --word_timestamps True \
  --output_format all \
  --output_dir . 2>&1 | tail -20
```

## Step 4: Ask About Translation

If the language is NOT English, ask the user: "Would you like me to also produce an English translation of the transcript? (yes/no)"

If the user says yes, run Whisper again with `--task translate` to produce an English translation:

```bash
cd "/c/Users/User/Build YouTube-FactChecker/data/transcribe" && \
whisper audio.mp3 \
  --model large-v3 \
  --language <LANGUAGE_CODE> \
  --task translate \
  --output_format txt \
  --output_dir . \
  -o audio_english 2>&1 | tail -10
```

This produces `audio_english.txt` containing the English translation.

## Step 5: Read and Process the Raw Transcript

Read the raw Whisper output:

```bash
cat "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.txt"
```

Also read the JSON output for segment timing information:

```bash
cat "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.json"
```

## Step 6: Transform into Polished Transcript

Now editorially transform the raw Whisper output into a polished, readable document. Follow these rules:

### Sentence and Prose Rules

1. **Fix fragmented output** — Whisper often breaks text at arbitrary points mid-sentence. Reassemble into complete, grammatically correct sentences.

2. **Preserve all content** — Every piece of information, example, statistic, name, date, and argument must be retained. Do NOT summarise, compress, or omit anything.

3. **Fix transcription artefacts** — Correct obvious mis-transcriptions (e.g. homophones, garbled names). Use context to infer the correct word. Mark genuinely unclear passages as `[unclear]`.

4. **Punctuation and capitalisation** — Add correct punctuation throughout. Capitalise proper nouns, names, organisations, and the start of sentences.

5. **Remove filler words** — Strip "um", "uh", "er", "ah", "you know", "like", false starts, and repeated phrases. Preserve intentional repetition for emphasis.

6. **Handle multiple speakers** — If the audio contains dialogue, interviews, panels, or Q&A between identifiable speakers, differentiate them clearly using bold speaker labels:

   **Speaker 1:** What they said...

   **Speaker 2:** Their response...

   If speaker names are known from context (host, guest name mentioned, interviewer, interviewee), use their actual names instead of generic labels. If only two speakers and names are unknown, use **Host:** and **Guest:**. For panels or more than two speakers, use **Speaker A:**, **Speaker B:**, **Speaker C:**, etc.

7. **Preserve the speaker's voice** — Keep distinctive phrases, regional expressions, and rhetorical style. Do not Westernise or genericise non-English speech patterns when translating ideas into prose.

### Structure Rules

8. **Organise into subtopics** — Read through all the content and identify the natural thematic segments. Group the content into sections with descriptive headings that reflect what is actually discussed. Use:
   - `## Heading` for major topics
   - `### Heading` for subtopics within a section

   Do NOT use chronological timestamps as headings. The headings should describe the content (e.g. "## Economic Outlook for 2025", "### Impact on Small Businesses").

9. **Add an introduction** — Write a brief introductory paragraph (3–5 sentences) summarising what the video covers, who is speaking, and its significance. This should orient a reader who has not seen the video.

10. **Add a conclusion** — Write a brief closing paragraph (2–4 sentences) synthesising the key points raised.

11. **Transitions** — Add smooth transition sentences between sections where the flow requires it.

### Quality Checklist

Before writing output, verify:
- Every substantive point from the raw transcript is present
- All sentences are complete and grammatically correct
- Speaker turns are clearly differentiated (if multiple speakers)
- Headings create a logical, scannable structure
- No filler words or transcript artefacts remain
- Introduction and conclusion are present

## Step 7: Write the Output Files

Write the polished transcript to a file. Use the video title (extracted from Whisper output or yt-dlp metadata) to name the file, slugified:

```bash
# Get video title
cd "/c/Users/User/Build YouTube-FactChecker/data/transcribe" && \
yt-dlp --get-title "$ARGUMENTS" 2>/dev/null || echo "transcript"
```

Write the polished transcript (in the original language) to:
`/c/Users/User/Build YouTube-FactChecker/data/transcribe/<slug>_transcript.md`

If an English translation was produced (Step 4), write the polished English version to:
`/c/Users/User/Build YouTube-FactChecker/data/transcribe/<slug>_transcript_en.md`

Each file should begin with a metadata header:

```
# <Video Title>

**Source:** <YouTube URL>
**Language:** <Language>
**Transcribed:** <Today's date>

---
```

Followed by the full polished transcript content.

## Step 8: Clean Up

Remove the large intermediate audio and raw Whisper files to save disk space:

```bash
rm -f "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.mp3" \
      "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.json" \
      "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.vtt" \
      "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.srt" \
      "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.tsv" \
      "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio.txt" \
      "/c/Users/User/Build YouTube-FactChecker/data/transcribe/audio_english.txt"
```

## Step 9: Report Summary

Display to the user:
- Video title and URL
- Language transcribed
- Whether an English translation was produced
- File path(s) of the output transcript(s)
- Word count of the polished transcript
- Number of sections/subtopics identified
- Any passages marked `[unclear]` that may need manual review
