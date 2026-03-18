---
description: Generate an image prompt for a research article thumbnail
allowed-tools: Read, Grep, Glob
---

Generate a professional image generation prompt for a research article thumbnail on the topic: $ARGUMENTS

## Instructions

1. **Understand the topic** — Parse the topic provided. If a research article already exists for this topic, read it briefly to understand the key themes and concepts.

2. **Generate the image prompt** — Create a detailed image generation prompt following these guidelines:

### Resolution & Aspect Ratio

- **Aspect ratio**: 16:9 (landscape)
- **Resolution**: 1536×864 pixels
- Always include both the aspect ratio and resolution in the generated prompt

### Style Specification (follow exactly for consistency)

- **Medium**: Digital illustration with subtle 3D depth. Not photorealistic, not flat vector — aim for a refined editorial illustration style with soft dimensionality
- **Rendering**: Smooth gradients, soft shadows, anti-aliased edges. No harsh outlines or cartoon-like strokes. Surfaces should feel slightly matte with occasional specular highlights on focal elements
- **Composition**: The title text is the primary focal element, centred in the image. Visual metaphor imagery serves as a supporting backdrop behind or around the text. Generous negative space around the text (at least 30% of the image). No border, no frame. The visual metaphor elements should occupy the background/midground and never obscure the title
- **Background**: Always a deep, dark tone — deep navy (#0a1628), charcoal (#1a1a2e), or near-black (#0d0d1a). Smooth gradient permitted (e.g., slightly lighter towards the centre to create a vignette). No patterns or textures in the background itself
- **Lighting**: Single primary light source from the upper-left at approximately 45 degrees. Soft, diffused cinematic lighting. Subtle rim lighting or edge glow on the focal element to separate it from the background. No harsh shadows
- **Colour palette**: Strictly limited to 2-3 accent colours maximum against the dark background. Accent colours should be muted and sophisticated, not saturated or neon. Choose accents thematically (gold/amber for debt/wealth, teal/blue for stability/tech, muted green for growth, warm red-orange for risk)
- **Texture**: Subtle film grain overlay (barely perceptible, ~5% opacity). Focal elements may have fine internal detail (grid lines, subtle patterns, translucency) but should not look busy
- **Mood**: Calm, authoritative, and contemplative — like the cover of a high-end financial research report
- **Title text**: The topic name must be the hero element of the image — bold, impossible to miss, and designed to grab attention. Use a clean, modern sans-serif typeface (like Helvetica Neue Bold, Inter Black, or DM Sans ExtraBold). The text MUST be rendered on a single horizontal line — never split across multiple lines or stacked vertically. All letters must be exactly the same font size and weight with uniform tracking (letter-spacing). The text should be uppercase, precisely centred both horizontally and vertically in the image (dead centre, equidistant from all four edges), and sized to fill 60-70% of the image width while remaining on one line. Use heavy/black font weight for maximum impact. Text colour should be bright white (#ffffff) with a strong luminous glow effect radiating outward (as if the text itself is a light source). The text must have a solid black (#000000) outline/stroke around each letter (2-3px weight) to sharply separate it from the background and glow effects, ensuring crisp legibility. Add a subtle outer glow in the topic's accent colour for extra depth and visual punch. The text should be the dominant focal point — the visual metaphor imagery should be secondary, sitting behind or subtly around the text, never competing with it. The text must feel powerful, premium, and click-worthy — like a title card for a high-budget documentary series. CRITICAL: The text must be on ONE single line, perfectly centred in the exact middle of the image, with all characters at uniform size
- **No numbers, labels, watermarks, or text other than the topic title**
- **No people, faces, hands, or human figures**
- **No logos, brand marks, or UI elements**

### Visual Metaphor Bank

Draw from these kinds of imagery based on the topic:
- **Debt/Credit**: Layered geometric planes, interlocking structures, bridges
- **Equities/Stocks**: Ascending lines, prisms refracting light, crystalline structures
- **Risk/Volatility**: Fractures, waves, turbulence patterns, storm imagery
- **Growth/Returns**: Upward spirals, expanding circles, light rays
- **Diversification**: Mosaic patterns, branching networks, scattered light
- **Commodities**: Raw material textures (metal, grain, oil), earth tones
- **Real Estate**: Architectural geometry, city silhouettes, foundations
- **Technology/Fintech**: Circuit patterns, digital grids, data streams
- **Global/Macro**: Globe outlines, interconnected nodes, map abstractions
- **Regulation**: Structured grids, frameworks, boundaries

### Prompt Format

Output the prompt in this exact format:

```
THUMBNAIL PROMPT
================
Topic: [Topic Name]

Prompt:
[The full image generation prompt, 4-6 sentences. Must specify: medium/style, subject/focal element, composition/placement, background colour, lighting direction and quality, accent colours, texture treatment, and resolution. Be precise and deterministic — another person reading this prompt should produce a near-identical image.]

Negative prompt:
extra text, subtitles, numbers, labels, logos, watermarks, people, faces, hands, fingers, human figures, realistic photography, photorealistic, cartoon, anime, cluttered, busy, noisy, low quality, blurry, oversaturated, neon colours, harsh shadows, multiple light sources, borders, frames, UI elements, misspelled text, garbled letters, stacked text, multi-line text, text on two lines, uneven text sizes, off-centre text, misaligned text
```

### Examples of Good Prompts

**Private Debt:**
"Editorial digital illustration with subtle 3D depth. The words 'PRIVATE DEBT' are rendered on a single horizontal line in a bold uppercase sans-serif typeface (heavy weight, uniform letter size throughout), placed at the exact dead centre of the image — equidistant from all four edges. The single-line text spans approximately 65% of the image width. The text is bright white (#ffffff) with a solid black (#000000) outline/stroke (2-3px) around each letter, a strong luminous glow radiating outward, and a soft warm amber (#c9963a) outer glow for depth. Behind the text, five translucent geometric planes intersect at shallow angles in a staggered arrangement, with faint internal grid lines and frosted-glass translucency, suggesting structured obligations. Deep navy background (#0a1628) with a soft radial gradient lighter at centre behind the text. Primary warm amber light source from upper-left at 45 degrees filtering through the background planes. Secondary subtle teal (#4a8a9e) rim light on plane edges. Fine film grain overlay at 5% opacity. 1536×864 pixels, 16:9 aspect ratio."

**Venture Capital:**
"Editorial digital illustration with subtle 3D depth. The words 'VENTURE CAPITAL' are rendered on a single horizontal line in a bold uppercase sans-serif typeface (extra-bold weight, uniform letter size throughout), placed at the exact dead centre of the image — equidistant from all four edges. The single-line text spans approximately 65% of the image width. The text is bright white (#ffffff) with a solid black (#000000) outline/stroke (2-3px) around each letter, a strong luminous glow, and a soft electric blue (#3d7ce0) outer glow creating a halo effect. Behind and beneath the text, a luminous seed-shaped form sits at lower-centre with six branching light trails expanding upward and outward, framing the text from below. Deep charcoal background (#1a1a2e) with a faint radial gradient lighter behind the text. Primary electric blue glow emanating from the seed, transitioning to soft white at the trail tips. Lighting from upper-left at 45 degrees with diffused cinematic quality. Fine film grain at 5% opacity. 1536×864 pixels, 16:9 aspect ratio."

## Output

Display the prompt clearly so the user can copy and paste it into their image generation tool.
