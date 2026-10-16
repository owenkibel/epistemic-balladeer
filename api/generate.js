import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Type
} from "@google/genai";

const BALLAD_SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  }
];

const ALLOWED_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-4-argon"
];

const GENRE_PRESETS = {
  AUTO: {
    label: "Auto-Match Persona",
    seedTags:
      "Match genre, period instrumentation, vocal register (e.g., baritone, mezzo-soprano), and BPM to the ballad's persona and setting."
  },
  BAROQUE_HARPSICHORD_LUTE: {
    label: "Baroque Harpsichord & Lute",
    seedTags:
      "Baroque chamber ballad, harpsichord continuo, Renaissance lute, viola da gamba, contrapuntal bassline, theatrical bass-baritone vocals, 104 bpm, crisp articulation, courtly wit"
  },
  CELTIC_TAVERN_FOLK: {
    label: "Celtic Tavern Folk",
    seedTags:
      "Celtic folk ballad, driving fiddle, soaring pennywhistle, resonant bodhran, acoustic guitar, warm storytelling baritone vocals, rousing pub chorus, 116 bpm, lively tavern acoustics"
  },
  ELECTRO_SWING: {
    label: "Electro-Swing",
    seedTags:
      "Electro-swing, theatrical harpsichord, punchy brass stabs, upright contrabass, marching snare, vintage swing groove, witty cabaret vocals, 122 bpm, playful and ironic"
  },
  AMERICANA_STRING_BAND: {
    label: "Americana String Band",
    seedTags:
      "Americana string band, driving fiddle, acoustic guitar, upright bass, mountain dulcimer, dry front-porch baritone vocals, subtle cosmic reverb, 110 bpm, rootsy and satirical"
  },
  EARLY_ENGLISH_CONSORT: {
    label: "Early English Consort",
    seedTags:
      "Early English broadside ballad, lute, viola da gamba, recorder consort, tabor drum, bass-baritone and mezzo-soprano duet, 98 bpm, Elizabethan tavern atmosphere"
  }
};

function buildSystemInstruction(
  afterHours,
  epistemicMode,
  includeSongStaging,
  musicGenre
) {
  const isRibald = Boolean(afterHours) || epistemicMode === "RIBALD_STATUS_IRONY";
  const genreConfig = GENRE_PRESETS[musicGenre] || GENRE_PRESETS.AUTO;

  const toneDirective = isRibald
    ? `### TONE: AFTER HOURS (RIBALD, EARTHY & SATIRICAL)
- Embrace the classic Restoration and broadside ballad contrast between lofty intellectual or aristocratic pretension and earthy, bawdy, anatomical, or irreverent human reality.
- Do not sanitize bawdy humor, dubious parentage, bodily appetites, double entendres, or sharp mockery of pompous authority.`
    : `### TONE: DRY PHILOSOPHICAL & SOCIAL SATIRE (PARLOR-SAFE)
- Use razor-sharp irony, worldly wit, and comic contrast between grand institutional pretension and petty human vanity or domestic inconvenience.
- Keep the humor clever, literary, and parlor-safe: avoid explicit sexual or anatomical ribaldry unless the user's seed line explicitly demands it.`;

  const songDirective = includeSongStaging
    ? `
### SINGLE-PASS SONG GENERATOR STAGING (ACE-STEP 1.5 / YUE2 / FLOW MUSIC)
In the same response, populate the "songStaging" object so the ballad can be rendered directly in AI music generators:
1. **styleTags:** Build a comma-separated tag list anchored on this selected musical style:
   - Target Genre Profile (${genreConfig.label}): ${genreConfig.seedTags}
   - Refine the vocal character and mood tags to fit the poem's specific narrator.
   - IMPORTANT: Do NOT include specific musical key names or modal scales (e.g., avoid "D Dorian" or "F sharp minor") in styleTags so prompt validation nodes never reject the string.
2. **structuredLyrics:** Format the song using strict bracketed section headers on their own lines:
   [Intro]
   [Verse 1]
   [Chorus]
   [Verse 2]
   [Chorus]
   [Outro]
   - Break 14-syllable fourteeners at their natural 8/6 caesura into singable 4-beat and 3-beat lines (or preserve crisp couplets) so vocal models breathe naturally.
   - Compose a catchy, repeatable 4-line **[Chorus]** that distills the narrator's ironic dilemma and uses the user's epistemic seed line as its final hook line.
   - Do not place stage directions inside the lyrics block so vocal models only sing the verse and chorus lines.
3. **coverArtPrompt:** A single vivid sentence describing an illustration or keyframe matching the ballad's setting, instruments (${genreConfig.label}), and ironic mood.`
    : "";

  return `You are a master formalist poet and songwriter in the tradition of Natural Classicism and English broadside balladry.
Your task is to take a user's clever, self-referential, or philosophical input line (or theme) and weave it into a rigorous, witty ballad.

### CORE CONCEPT: EPISTEMIC CREATIVITY
Many inputs exhibit "epistemic recursion"—where a cognitive, social, or moral concept is turned back upon itself (e.g., questioning how much certainty one is certain to have, what authority authorizes one's authority, or how much skepticism one may skeptically permit).
Ground this premise in a concrete dramatic persona (a reluctant guild master, a minor magistrate, an imposter astronomer, a harried courtier, or an over-promoted clerk).

${toneDirective}

### POETIC FORMS SUPPORTED

1. **FOURTEENER_12 (Unconventional Joined Ballad / 14-Syllable Heptameter):**
   - **Structure:** Exactly 12 lines divided into TWO 6-line stanzas (Stanza 1: lines 1–6; Stanza 2: lines 7–12).
   - **Rhyme Scheme:** Rhyming couplets (AABBCC DDEEFF).
   - **Meter:** Iambic heptameter (the "Fourteener"). Each line MUST contain 14 syllables (7 iambic feet: da-DUM da-DUM da-DUM da-DUM || da-DUM da-DUM da-DUM), joining a 4-beat ballad line (8 syllables) and a 3-beat ballad line (6 syllables) with a natural syntactic pause (caesura) after the 8th syllable.
   - **Rhetorical Architecture:**
     - *Lines 1–2:* Establish the narrator's dubious status, inheritance, or paradoxical office.
     - *Lines 3–4 (The Anadiplosis Hinge):* Echo a key phrase from the end of Line 2 at the start of Line 3, splitting its meaning between lofty pretension and mundane or comic reality.
     - *Lines 5–6:* Conclude Stanza 1 with an ironic maxim about human nature, skill, or station.
     - *Lines 7–8:* Introduce a shift in circumstance and a foil character (a spouse, mentor, counselor, or rival) who pushes the narrator to exercise newfound leverage.
     - *Lines 9–11 (The Bathos Tricolon):* List three demands urged by the foil: two grand, sweeping ambitions in Lines 9 and 10, followed in Line 11 by an absurdly petty domestic demand (ending with an em-dash "—").
     - *Line 12 (The Recursive Resolution):* Deliver the user's seed line (adapted only as much as strictly necessary to fit the 7-foot rhythm and rhyme with Line 11) as the final punchline.

2. **BALLAD_SHORT (Conventional 4/3 Common Measure Quatrains):**
   - **Structure:** 6 quatrains (24 lines total, equivalent in beat length to 12 fourteeners).
   - **Meter:** Alternating iambic tetrameter (8 syllables / 4 beats) in odd lines and iambic trimeter (6 syllables / 3 beats) in even lines.
   - **Rhyme Scheme:** ABCB or ABAB in each quatrain.
   - **Rhetorical Architecture:** Follow the same narrative progression—dubious station (Stanzas 1–2), ironic contrast (Stanza 3), foil character's grand escalation (Stanzas 4–5), and the sudden domestic drop leading into the user's seed line split across Lines 23 and 24 (Stanza 6).
${songDirective}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server missing GEMINI_API_KEY1 environment variable."
    });
  }

  try {
    const {
      seedLine,
      form = "FOURTEENER_12",
      epistemicMode = "AUTO",
      musicGenre = "BAROQUE_HARPSICHORD_LUTE",
      afterHours = false,
      includeSongStaging = true,
      modelName = "gemini-3.5-flash-lite"
    } = req.body || {};

    if (!seedLine || typeof seedLine !== "string" || seedLine.trim().length < 5) {
      return res.status(400).json({
        error: "Please provide a clever seed line or premise."
      });
    }

    const selectedModel = ALLOWED_MODELS.includes(modelName)
      ? modelName
      : "gemini-3.5-flash-lite";

    const selectedGenreKey = GENRE_PRESETS[musicGenre]
      ? musicGenre
      : "BAROQUE_HARPSICHORD_LUTE";
    const genreInfo = GENRE_PRESETS[selectedGenreKey];

    const isRibald = Boolean(afterHours) || epistemicMode === "RIBALD_STATUS_IRONY";
    const wantSong = Boolean(includeSongStaging);

    const ai = new GoogleGenAI({ apiKey });

    const userPrompt = `Compose a ballad built around this user seed line:
"${seedLine.trim()}"

Selected Poetic Form: ${form}
Epistemic & Satirical Framing Angle: ${epistemicMode}
After Hours (Ribald Mode): ${isRibald ? "ENABLED" : "DISABLED (keep parlor-safe and dryly ironic)"}
Include Song Generator Lyrics & Chorus (ACE-Step 1.5 / YuE2 / Flow): ${wantSong ? "YES" : "NO"}
Musical Genre Style: ${genreInfo.label} (${genreInfo.seedTags})

Ensure strict adherence to the syllable counts, iambic rhythm, internal caesura (for FOURTEENER_12), anadiplosis turn, and bathos escalation leading seamlessly into the final line.`;

    const schemaProperties = {
      title: {
        type: Type.STRING,
        description: "An uppercase ballad title in classic broadside style (e.g., THE BALLAD OF THE ...)."
      },
      stanzas: {
        type: Type.ARRAY,
        items: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        description: "Array of stanzas, where each stanza is an array of verse lines."
      },
      epistemicAnalysis: {
        type: Type.OBJECT,
        properties: {
          recursiveMechanic: {
            type: Type.STRING,
            description: "1-2 sentences explaining the second-order epistemic loop and status contrast."
          },
          metricalNotes: {
            type: Type.STRING,
            description: "Brief note on how the 4/3 caesura or ballad meter shapes the final punchline."
          }
        },
        required: ["recursiveMechanic", "metricalNotes"]
      }
    };

    const requiredFields = ["title", "stanzas", "epistemicAnalysis"];

    if (wantSong) {
      schemaProperties.songStaging = {
        type: Type.OBJECT,
        properties: {
          styleTags: {
            type: Type.STRING,
            description: "Comma-separated genre, instrument, vocal, BPM, and mood tags for ACE-Step 1.5, YuE2, or Flow Music."
          },
          structuredLyrics: {
            type: Type.STRING,
            description: "Full singable lyrics with [Intro], [Verse 1], [Chorus], [Verse 2], [Chorus], and [Outro] tags, using the epistemic seed line as the Chorus hook."
          },
          coverArtPrompt: {
            type: Type.STRING,
            description: "Single-sentence visual keyframe prompt for album art or video backdrop."
          }
        },
        required: ["styleTags", "structuredLyrics", "coverArtPrompt"]
      };
      requiredFields.push("songStaging");
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userPrompt,
      config: {
        systemInstruction: buildSystemInstruction(
          afterHours,
          epistemicMode,
          wantSong,
          selectedGenreKey
        ),
        temperature: 0.8,
        safetySettings: BALLAD_SAFETY_SETTINGS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: requiredFields
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") {
      return res.status(422).json({
        error: "Even the tavern balladeer blushed at that one (blocked by core platform safety)."
      });
    }

    const payload = JSON.parse(response.text);
    return res.status(200).json({
      ...payload,
      metadata: {
        modelUsed: selectedModel,
        form,
        epistemicMode,
        musicGenre: selectedGenreKey,
        musicGenreLabel: genreInfo.label,
        afterHours: isRibald,
        includeSongStaging: wantSong,
        seedLine: seedLine.trim(),
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Gemini Ballad Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to compose ballad."
    });
  }
}