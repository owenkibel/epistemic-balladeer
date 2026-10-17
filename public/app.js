import JSZip from "https://esm.sh/jszip@3.10.1";

const STORAGE_KEY = "epistemic_balladeer_vault_v1";
const MAX_VAULT_ITEMS = 40;

const seedInput = document.getElementById("seedLine");
const formSelect = document.getElementById("formSelect");
const epistemicMode = document.getElementById("epistemicMode");
const genreSelect = document.getElementById("genreSelect");
const modelSelect = document.getElementById("modelSelect");
const songStagingToggle = document.getElementById("songStagingToggle");
const afterHoursToggle = document.getElementById("afterHoursToggle");
const generateBtn = document.getElementById("generateBtn");
const statusMsg = document.getElementById("statusMsg");

const outputCard = document.getElementById("outputCard");
const poemTitle = document.getElementById("poemTitle");
const poemMetaBadge = document.getElementById("poemMetaBadge");
const poemBody = document.getElementById("poemBody");
const recursiveNote = document.getElementById("recursiveNote");
const metricalNote = document.getElementById("metricalNote");
const copyMdBtn = document.getElementById("copyMdBtn");
const downloadMdBtn = document.getElementById("downloadMdBtn");

const songStagingDrawer = document.getElementById("songStagingDrawer");
const songStyleTags = document.getElementById("songStyleTags");
const songLyricsBody = document.getElementById("songLyricsBody");
const coverArtPrompt = document.getElementById("coverArtPrompt");
const copyTagsBtn = document.getElementById("copyTagsBtn");
const copyLyricsBtn = document.getElementById("copyLyricsBtn");
const copyArtBtn = document.getElementById("copyArtBtn");

const vaultSection = document.getElementById("vaultSection");
const vaultCount = document.getElementById("vaultCount");
const vaultList = document.getElementById("vaultList");
const exportZipBtn = document.getElementById("exportZipBtn");
const clearVaultBtn = document.getElementById("clearVaultBtn");

let currentPoemEntry = null;

epistemicMode.addEventListener("change", () => {
  if (epistemicMode.value === "RIBALD_STATUS_IRONY") {
    afterHoursToggle.checked = true;
  }
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    seedInput.value = chip.dataset.seed;
  });
});

function loadVault() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVault(items) {
  const trimmed = items.slice(0, MAX_VAULT_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  renderVaultUI(trimmed);
}

function addPoemToVault(entry) {
  const vault = loadVault();
  vault.unshift(entry);
  saveVault(vault);
}

function deletePoemFromVault(id) {
  const vault = loadVault().filter((item) => item.id !== id);
  saveVault(vault);
}

function slugify(text) {
  return (text || "ballad")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "ballad";
}

function buildMarkdownWithYaml(entry) {
  const meta = entry.metadata || {};
  const safeTitle = (entry.title || "UNTITLED BALLAD").replace(/"/g, '\\"');
  const safeSeed = (meta.seedLine || "").replace(/"/g, '\\"');
  const stanzaText = (entry.stanzas || [])
    .map((stanza) => stanza.join("\n"))
    .join("\n\n");

  const lines = [
    "---",
    `title: "${safeTitle}"`,
    `date: "${meta.createdAt || new Date().toISOString()}"`,
    `model: "${meta.modelUsed || "gemini-3.5-flash-lite"}"`,
    `form: "${meta.form || "FOURTEENER_12"}"`,
    `epistemic_strategy: "${meta.epistemicMode || "AUTO"}"`,
    `music_genre: "${meta.musicGenreLabel || meta.musicGenre || "Baroque Harpsichord & Lute"}"`,
    `after_hours: ${Boolean(meta.afterHours)}`,
    `song_staging: ${Boolean(entry.songStaging)}`,
    `seed_line: "${safeSeed}"`,
    "---",
    "",
    `# ${entry.title}`,
    "",
    stanzaText,
    "",
    "---",
    "",
    "## Epistemic & Metrical Architecture",
    "",
    `- **Recursive Mechanic:** ${entry.epistemicAnalysis?.recursiveMechanic || "N/A"}`,
    `- **Metrical Craft:** ${entry.epistemicAnalysis?.metricalNotes || "N/A"}`,
    ""
  ];

  if (entry.songStaging) {
    lines.push(
      "---",
      "",
      `## Song Generator Staging (${meta.musicGenreLabel || "ACE-Step 1.5 / YuE2 / Flow"})`,
      "",
      "### Style & Instrumentation Tags",
      "```text",
      entry.songStaging.styleTags || "",
      "```",
      "",
      "### Structured Lyrics",
      "```text",
      entry.songStaging.structuredLyrics || "",
      "```",
      "",
      "### Cover Art / Keyframe Prompt",
      "```text",
      entry.songStaging.coverArtPrompt || "",
      "```",
      ""
    );
  }

  return lines.join("\n");
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function flashCopyButton(btn, textToCopy) {
  if (!textToCopy) return;
  await navigator.clipboard.writeText(textToCopy);
  const orig = btn.textContent;
  btn.textContent = "Copied!";
  setTimeout(() => {
    btn.textContent = orig;
  }, 1400);
}

copyTagsBtn.addEventListener("click", () =>
  flashCopyButton(copyTagsBtn, currentPoemEntry?.songStaging?.styleTags)
);
copyLyricsBtn.addEventListener("click", () =>
  flashCopyButton(copyLyricsBtn, currentPoemEntry?.songStaging?.structuredLyrics)
);
copyArtBtn.addEventListener("click", () =>
  flashCopyButton(copyArtBtn, currentPoemEntry?.songStaging?.coverArtPrompt)
);

function displayPoem(entry) {
  currentPoemEntry = entry;
  poemTitle.textContent = entry.title;

  const meta = entry.metadata || {};
  const modeBadge = meta.afterHours ? "After Hours (Ribald)" : "Parlor Satire";
  const genreBadge = entry.songStaging
    ? ` • 🎵 ${meta.musicGenreLabel || meta.musicGenre || "Song Staged"}`
    : "";
  poemMetaBadge.textContent = `${meta.modelUsed || "gemini-3.5-flash-lite"} • ${meta.form || "FOURTEENER_12"} • ${modeBadge}${genreBadge}`;

  poemBody.innerHTML = "";
  (entry.stanzas || []).forEach((stanzaLines) => {
    const stanzaDiv = document.createElement("div");
    stanzaDiv.className = "stanza";
    stanzaLines.forEach((line) => {
      const p = document.createElement("p");
      p.className = "verse-line";
      p.textContent = line;
      stanzaDiv.appendChild(p);
    });
    poemBody.appendChild(stanzaDiv);
  });

  recursiveNote.textContent = entry.epistemicAnalysis?.recursiveMechanic || "";
  metricalNote.textContent = entry.epistemicAnalysis?.metricalNotes || "";

  if (entry.songStaging) {
    songStyleTags.textContent = entry.songStaging.styleTags || "";
    songLyricsBody.textContent = entry.songStaging.structuredLyrics || "";
    coverArtPrompt.textContent = entry.songStaging.coverArtPrompt || "";
    songStagingDrawer.hidden = false;
  } else {
    songStagingDrawer.hidden = true;
  }

  outputCard.hidden = false;
}

function renderVaultUI(vault = loadVault()) {
  vaultCount.textContent = String(vault.length);
  if (vault.length === 0) {
    vaultSection.hidden = true;
    vaultList.innerHTML = "";
    return;
  }

  vaultSection.hidden = false;
  vaultList.innerHTML = "";

  vault.forEach((item) => {
    const row = document.createElement("div");
    row.className = "vault-item";

    const info = document.createElement("div");
    info.className = "vault-item-info";
    info.addEventListener("click", () => {
      displayPoem(item);
      outputCard.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const titleEl = document.createElement("div");
    titleEl.className = "vault-item-title";
    titleEl.textContent = item.title;

    const subEl = document.createElement("div");
    subEl.className = "vault-item-sub";
    const dateStr = item.metadata?.createdAt
      ? new Date(item.metadata.createdAt).toLocaleString()
      : "";
    const tag = item.metadata?.afterHours ? "After Hours" : "Standard";
    const genreTag = item.songStaging
      ? ` • 🎵 ${item.metadata?.musicGenreLabel || "Song"}`
      : "";
    subEl.textContent = `"${item.metadata?.seedLine || ""}" — ${item.metadata?.modelUsed || ""} (${tag}${genreTag}) • ${dateStr}`;

    info.appendChild(titleEl);
    info.appendChild(subEl);

    const actions = document.createElement("div");
    actions.className = "vault-item-actions";

    const dlBtn = document.createElement("button");
    dlBtn.type = "button";
    dlBtn.className = "mini-btn";
    dlBtn.textContent = ".md";
    dlBtn.title = "Download Markdown";
    dlBtn.addEventListener("click", () => {
      const md = buildMarkdownWithYaml(item);
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      triggerBlobDownload(blob, `${slugify(item.title)}.md`);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "mini-btn danger";
    delBtn.textContent = "×";
    delBtn.title = "Delete from archive";
    delBtn.addEventListener("click", () => deletePoemFromVault(item.id));

    actions.appendChild(dlBtn);
    actions.appendChild(delBtn);

    row.appendChild(info);
    row.appendChild(actions);
    vaultList.appendChild(row);
  });
}

downloadMdBtn.addEventListener("click", () => {
  if (!currentPoemEntry) return;
  const md = buildMarkdownWithYaml(currentPoemEntry);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  triggerBlobDownload(blob, `${slugify(currentPoemEntry.title)}.md`);
});

copyMdBtn.addEventListener("click", () => {
  if (!currentPoemEntry) return;
  flashCopyButton(copyMdBtn, buildMarkdownWithYaml(currentPoemEntry));
});

exportZipBtn.addEventListener("click", async () => {
  const vault = loadVault();
  if (vault.length === 0) return;

  exportZipBtn.disabled = true;
  const origText = exportZipBtn.textContent;
  exportZipBtn.textContent = "Zipping...";

  try {
    const zip = new JSZip();
    const exportTimestamp = new Date().toISOString();
    const stamp = exportTimestamp.slice(0, 10);

    const indexLines = [
      "---",
      `title: "The Epistemic Balladeer — Archive Index (${stamp})"`,
      `date: "${exportTimestamp}"`,
      `description: "Index of ${vault.length} exported ballads from The Epistemic Balladeer."`,
      `model: "archive-index"`,
      `form: "INDEX"`,
      `epistemic_strategy: "INDEX"`,
      `music_genre: "Multiple"`,
      `after_hours: false`,
      `song_staging: false`,
      `seed_line: "Archive index of ${vault.length} ballads"`,
      "---",
      "",
      "# The Epistemic Balladeer — Archive Export",
      "",
      `Exported: ${exportTimestamp}`,
      `Total Ballads: ${vault.length}`,
      ""
    ];

vault.forEach((item, idx) => {
      const num = String(idx + 1).padStart(2, "0");
      const filename = `${num}-${slugify(item.title)}.md`;
      zip.file(filename, buildMarkdownWithYaml(item));
      const genreLabel = item.metadata?.musicGenreLabel
        ? ` [${item.metadata.musicGenreLabel}]`
        : "";
      // Render title in bold without a broken .md filename hyperlink:
      indexLines.push(
        `${idx + 1}. **${item.title}** — *${item.metadata?.seedLine || ""}* (\`${item.metadata?.modelUsed || ""}\`)${genreLabel}`
      );
    });

    zip.file("index.md", indexLines.join("\n") + "\n");

    const zipBlob = await zip.generateAsync({ type: "blob" });
    triggerBlobDownload(zipBlob, `epistemic-ballads-${stamp}.zip`);
  } finally {
    exportZipBtn.disabled = false;
    exportZipBtn.textContent = origText;
  }
});

clearVaultBtn.addEventListener("click", () => {
  if (confirm("Clear all saved ballads from your browser's localStorage?")) {
    saveVault([]);
  }
});

generateBtn.addEventListener("click", async () => {
  const seedLine = seedInput.value.trim();
  if (!seedLine) {
    statusMsg.textContent = "Please enter a concluding line or philosophical premise first.";
    statusMsg.hidden = false;
    return;
  }

  generateBtn.disabled = true;
  statusMsg.textContent = songStagingToggle.checked
    ? "Composing ballad and staging [Verse]/[Chorus] song lyrics in one pass..."
    : "Scanning heptameters and calibrating bathos...";
  statusMsg.hidden = false;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seedLine,
        form: formSelect.value,
        epistemicMode: epistemicMode.value,
        musicGenre: genreSelect.value,
        afterHours: afterHoursToggle.checked,
        includeSongStaging: songStagingToggle.checked,
        modelName: modelSelect.value
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Generation failed.");
    }

    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...data
    };

    displayPoem(entry);
    addPoemToVault(entry);
    statusMsg.hidden = true;
  } catch (err) {
    statusMsg.textContent = `Error: ${err.message}`;
    statusMsg.hidden = false;
  } finally {
    generateBtn.disabled = false;
  }
});

renderVaultUI();