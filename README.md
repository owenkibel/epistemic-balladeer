# The Epistemic Balladeer

**Natural Classicism • Recursive Verse & Single-Pass Song Engine**

**The Epistemic Balladeer** is a serverless poetic and lyrical generation engine powered by the Google Gemini API (`gemini-3.5-flash-lite`, `gemini-3.8-flash`, and `gemini-4-argon`). Expanding upon the prosody-telemetry and local-archival architecture of its sister limerick project, **[Fifth Line: Gemini Edition](https://github.com/owenkibel/fifth-line-gemini)**, this application transforms self-referential quips, second-order paradoxes, and philosophical premises into metrically rigorous English ballads and chorus-ready song lyrics in a single API pass. The app was developed in conversation with Gemini 4 Argon with Thinking High.

---

## Rationale: Epistemic Creativity & Metrical Form

Many of the sharpest comic and philosophical observations rely on **epistemic recursion**—turning a normative, cognitive, or institutional concept back upon itself:
- *Measuring how much certainty one is certain to possess.*
- *Auditing the authority that authorizes one's authority.*
- *Doubting the degree of doubt one is permitted to hold.*

When stated in prose, second-order reflexivity can feel bloodless or abstract.  **The Epistemic Balladeer** is grounded in the poetic philosophy of Frederick Turner's *Natural Classicism*:

[An Ecopoetics of Beauty and Meaning](https://icus.org/wp-content/uploads/2017/05/Turner-Frederick-An-Ecopoetics-of-Beauty-and-Meaning.pdf)

[The Birth of Natural Classicism](https://wilsonquarterly.com/quarterly/biology-destiny/birth-natural-classicism)
 
The app treats strict metrical form not as an artificial cage, but as an acoustic carrier wave. By embodying an abstract paradox inside a concrete dramatic persona—a reluctant guild master, a dubious heir, an imposter astronomer, or an over-promoted magistrate—and driving the narrative through strict heptameter or common-measure rhythm, the philosophical punchline lands with physical inevitability.

---

## Poetic & Rhetorical Techniques

The engine enforces specific structural and rhetorical devices drawn from traditional broadside balladry and Restoration satire:

### 1. Dual Ballad Architectures
- **Joined Fourteener (`FOURTEENER_12`):** Composed of 12 lines arranged in two 6-line stanzas of rhyming couplets (`AABBCC DDEEFF`). Each line is written in **iambic heptameter** (14 syllables / 7 iambic feet), representing the older English fusion of a 4-beat tetrameter phrase (8 syllables) and a 3-beat trimeter phrase (6 syllables) divided by a natural syntactic pause (**caesura**) after the 8th syllable:
  `[da-DUM da-DUM da-DUM da-DUM || da-DUM da-DUM da-DUM]`
- **Conventional Common Measure (`BALLAD_SHORT`):** Composed of 6 quatrains (24 lines total, matching the 84-beat length of the 12 fourteeners), alternating 8-syllable iambic tetrameter and 6-syllable iambic trimeter lines (`ABCB` or `ABAB`).

### 2. The Anadiplosis Hinge
In the opening stanza, the narrator establishes a paradoxical office or dubious pedigree. Between Lines 2 and 3, the poem executes an **anadiplosis pivot**: a key phrase from the end of Line 2 is immediately echoed at the beginning of Line 3 to split an elevated, aristocratic, or scholarly pretension into a mundane or comic reality.

### 3. The Tricolon-to-Bathos Cadence
In the second stanza, a foil character (a spouse, patron, rival, or counselor) urges the narrator to flex their newfound leverage. Across Lines 9–11, the poem builds a **tricolon of bathos**:
- **Lines 9–10:** Two grand, sweeping institutional or imperial ambitions.
- **Line 11:** A sudden drop into a petty domestic chore, broken by an em-dash (`—`).
- **Line 12:** The user's recursive epistemic seed line delivered as the disarming final couplet resolution.

### 4. Parlor Satire vs. After Hours Mode
- **Parlor Satire (Default):** Keeps the irony dry, literary, and parlor-safe, focusing on institutional vanity and scholarly pretension.
- **After Hours Mode (Opt-In Toggle):** Unlocks traditional broadside and Restoration tavern wit—colliding lofty metaphysical or noble airs with earthy, ribald, and irreverent human appetites via explicit API `safetySettings` (`BLOCK_NONE`) paired with satirical system instructions.

---

## Single-Pass Song Generator Staging

Because a 14-syllable Fourteener naturally divides at its 8/6 caesura into singable 4-beat and 3-beat breath phrases, ballads map seamlessly into AI music generators such as **ACE-Step 1.5**, **YuE2**, and **Flow Music**.

Rather than making a slow second API round-trip for media prompts, **The Epistemic Balladeer** optionally generates a complete `songStaging` package inside the **first and only API call**:
1. **Instrumentation & Style Tags:** Pre-tuned genre palettes free of modal scale strings that could trip prompt validators:
   - *Baroque Harpsichord & Lute* (harpsichord continuo, Renaissance lute, viola da gamba, theatrical bass-baritone)
   - *Celtic Tavern Folk* (driving fiddle, pennywhistle, bodhran, acoustic guitar, rousing pub chorus)
   - *Electro-Swing* (theatrical harpsichord, punchy brass stabs, contrabass, vintage swing groove)
   - *Americana String Band* (fiddle, mountain dulcimer, upright bass, dry front-porch baritone)
   - *Early English Consort* (lute, viola da gamba, recorder consort, tabor drum, vocal duet)
2. **Chorus-Equipped Lyrics:** Adapts the ballad stanzas into `[Intro]`, `[Verse 1]`, `[Chorus]`, `[Verse 2]`, `[Chorus]`, and `[Outro]` sections, composing a repeatable 4-line **`[Chorus]`** hook that culminates in the user's epistemic seed line.
3. **Single-Pass Cover Art Prompt:** A one-sentence visual keyframe prompt matching the persona and musical instrumentation.

---

## Local Archive & Markdown / ZIP Export

- **40-Ballad `localStorage` Vault:** Automatically persists your 40 most recent ballads directly in the browser (`epistemic_balladeer_vault_v1`).
- **YAML Front-Matter `.md` Export:** Copy or download any ballad as a self-contained Markdown file complete with structured YAML metadata (`title`, `date`, `model`, `form`, `epistemic_strategy`, `music_genre`, `after_hours`, `seed_line`), stanzas, metrical analysis, and song staging blocks.
- **Batch `.zip` Export (`JSZip`):** Bundles the entire local archive into a numbered `.zip` collection with an auto-generated `INDEX.md` table of contents.

---

## Project Structure

```text
epistemic-balladeer/
├── api/
│   └── generate.js          # Vercel Node.js Serverless Route Controller (@google/genai)
├── functions/
│   └── api/
│       └── generate.js      # Optional Cloudflare Pages Function equivalent
├── public/
│   ├── index.html           # Broadside UI, controls, and song staging drawers
│   ├── style.css            # Dark slate literary theme
│   └── app.js               # Fetch logic, localStorage vault, and JSZip exporter
├── package.json
├── vercel.json              # Vercel function maxDuration (60s) configuration
└── LICENSE                  # MIT License
```

## Local Setup & Development
1. Prerequisites
Node.js (v20+ recommended)

A Google Gemini API Key from Google AI Studio

2. Install Dependencies
```Bash
git clone [https://github.com/owenkibel/epistemic-balladeer.git](https://github.com/owenkibel/epistemic-balladeer.git)
cd epistemic-balladeer
npm install
```
3. Configure Your Environment Variable
The backend route checks for GEMINI_API_KEY1 first and falls back to GEMINI_API_KEY. You can either export it in your shell (e.g., ~/.config/fish/config.fish or ~/.bashrc) or create a .env.local file in the project root:

```Bash
echo "GEMINI_API_KEY1=your_gemini_api_key_here" > .env.local
```
4. Run Locally with Vercel CLI
```Bash
npx vercel dev
```
Open http://localhost:3000 in your browser.

## License
Released under the MIT License.