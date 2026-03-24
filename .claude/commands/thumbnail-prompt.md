---
description: Generate an image prompt for a research article thumbnail
allowed-tools: Read, Grep, Glob
---

Generate a professional image generation prompt for a research article thumbnail on the topic: $ARGUMENTS

## Instructions

1. **Understand the topic** — Parse the topic provided. If a research article already exists for this topic, read it briefly to understand the key themes and concepts.

2. **Generate the image prompt** — Create a detailed image generation prompt following these guidelines:

### Resolution & Aspect Ratio

- **Aspect ratio**: 16:9 (widescreen)
- **Resolution**: 1536×864 pixels
- Always include both the aspect ratio and resolution in the generated prompt

### Style Specification (follow exactly for consistency)

- **Design philosophy**: Ultra-minimal, moody, abstract. No text whatsoever. The image is purely atmospheric — translucent geometric forms floating in a dark void with subtle light interactions. The look is cinematic and refined, like concept art for a premium fintech brand.
- **Background**: Deep, dark gradient filling the entire canvas. The base tone is always dark — deep navy, near-black blue, or dark charcoal. Choose ONE dark palette per topic:
  - Warm dark: deep navy (#0a0e1a) to dark indigo (#151530) with warm amber (#c88030) and gold (#d4a040) light accents — for debt, real estate, commodities, value investing
  - Cool dark: midnight blue (#080c18) to dark slate (#101828) with cool cyan (#40a0c0) and ice blue (#70b8d8) light accents — for tech, fintech, equities, AI
  - Neutral dark: charcoal (#0c0c10) to deep graphite (#181820) with soft warm white (#d0c8b8) and muted silver (#a0a0a8) light accents — for macro, regulation, diversification, bonds
  - Rich dark: dark plum (#100818) to deep midnight (#0c1020) with magenta (#b060a0) and soft violet (#8070c0) light accents — for alternatives, venture capital, growth, emerging markets
- **Geometric forms**: The hero element. Translucent, glass-like geometric shapes arranged in a visually striking composition. For EACH prompt, pick ONE geometry style from this list (vary across topics — never repeat the same style consecutively):
  1. **Cascading panels** — 3-5 translucent rectangular panels arranged in a diagonal cascade, overlapping slightly, each catching light differently
  2. **Floating prisms** — 2-3 large translucent triangular prisms or pyramids at different angles, with light refracting through them
  3. **Concentric rings** — Thin translucent rings or arcs of varying radii, nested but offset from centre, some partial/cropped
  4. **Stacked discs** — Thin translucent circular discs stacked at a slight angle, creating a layered depth effect
  5. **Intersecting planes** — 2-4 large flat translucent planes intersecting at angles, creating sharp geometric intersections
  6. **Suspended cubes** — 2-3 translucent cubes or rectangular volumes floating at different depths, slightly rotated
  7. **Curved ribbons** — Flowing translucent ribbon-like strips curving through 3D space, elegant and minimal
  8. **Hexagonal lattice** — A sparse arrangement of translucent hexagonal cells, some filled, some empty, at varying depths
  - The geometric forms should:
    - Appear translucent/glass-like with visible light passing through and subtle refraction
    - Have soft edges with a slight frosted glass quality — not perfectly clear, not fully opaque
    - Show subtle grid lines or wireframe texture on their surfaces (very faint, like graph paper)
    - Be lit from one side, creating a gradient of warm-to-cool across the forms (warm light on one side, cool ambient on the other)
    - Cast soft, diffused shadows onto the background
    - Have a slight grain/noise texture over everything for a tactile, premium feel
    - Be placed in the centre or slightly off-centre of the composition
    - Float in space with a sense of depth and dimension
- **Lighting**: Cinematic and dramatic. One primary light source casting warm tones (amber/gold) from one side, with cooler ambient fill from the opposite side. The light should interact with the translucent geometry — glowing through the forms, creating subtle caustics and light spill on the background. The overall mood is dark but not flat — rich with subtle light variation.
- **Texture**: A fine film grain or subtle noise overlay across the entire image (like 35mm film grain). This adds a tactile, premium quality and prevents the image from looking too digitally clean.
- **Absolutely NO text** — no titles, labels, watermarks, or any written characters of any kind
- **No people, faces, hands, or human figures**
- **No logos, brand marks, icons, or UI elements**
- **No realistic objects** — purely abstract geometric forms

### Prompt Format

Output the prompt in this exact format:

```
THUMBNAIL PROMPT
================
Topic: [Topic Name]

Prompt:
[The full image generation prompt, 5-7 sentences. Must specify: dark background gradient colours, geometry style chosen (from the numbered list), number and arrangement of geometric forms, translucency and glass-like qualities, lighting direction and colour temperatures (warm vs cool sides), shadow treatment, grain/noise texture, and resolution. Be precise and deterministic — another person reading this prompt should produce a near-identical image.]

Negative prompt:
text, titles, labels, words, letters, numbers, watermarks, logos, people, faces, hands, fingers, human figures, realistic photography, photorealistic, cartoon, anime, cluttered, busy, noisy, low quality, blurry, bright background, white background, pastel colours, flat lighting, no shadows, icons, UI elements, borders, frames, realistic objects, illustrations, diagrams, charts, neon colours, oversaturated, multiple light sources, symmetrical composition
```

### Examples of Good Prompts

**Private Debt:**
"Ultra-minimal abstract thumbnail. Deep dark gradient background from navy (#0a0e1a) to dark indigo (#151530). In the centre-right of the composition, 4 translucent glass-like rectangular panels are arranged in a diagonal cascade from lower-left to upper-right, each overlapping slightly. The panels have a frosted glass translucency with very faint grid-line textures on their surfaces. A warm amber-gold light (#c88030) illuminates from the left side, glowing through the leftmost panels and creating warm highlights, while the rightmost panels pick up a cooler blue-cyan ambient tone (#40a0c0). The panels cast soft diffused shadows onto the dark background below them. Subtle caustic light spills onto the background around the panels. A fine 35mm film grain texture overlays the entire image for a tactile, premium feel. No text. 1536×864 pixels, 16:9 aspect ratio."

**Venture Capital:**
"Ultra-minimal abstract thumbnail. Deep dark gradient background from dark plum (#100818) to midnight (#0c1020). Two large translucent triangular prisms float in the centre of the composition, angled toward each other at different rotations, with glass-like surfaces showing faint wireframe grid lines. A rich magenta-violet light (#b060a0) illuminates from the upper-left, refracting through the prisms and casting soft violet caustics onto the dark background. The opposite faces pick up a cooler muted silver tone. The prisms have a frosted translucency — not fully clear, with soft feathered edges. Diffused shadows fall beneath them, grounding them in the space. Fine film grain noise across the entire image. No text. 1536×864 pixels, 16:9 aspect ratio."

**Inference Tokenomics:**
"Ultra-minimal abstract thumbnail. Deep dark gradient background from midnight blue (#080c18) to dark slate (#101828). A sparse arrangement of translucent hexagonal cells floats in the centre of the composition — some filled with frosted glass, some empty outlines, at varying depths creating parallax. A cool cyan light (#40a0c0) illuminates from the right side, passing through the hexagonal forms and creating ice-blue highlights and subtle refraction. The left-facing surfaces pick up a warmer muted amber tone (#c8a060). Faint grid-line textures are visible on the hexagonal surfaces. Soft shadows are cast between the layered hexagons. A fine 35mm film grain overlays the entire image. No text. 1536×864 pixels, 16:9 aspect ratio."

## Output

Display the prompt clearly so the user can copy and paste it into their image generation tool.
