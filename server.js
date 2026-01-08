import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

import { aiText } from "./src/ai.js";
import { buildDocxBuffer } from "./src/docx.js";
import { buildPromptCP, buildPromptTP, buildPromptFull } from "./src/prompts.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// In-memory store (boleh ganti DB kalau mau)
const store = new Map();

function requireBody(fields = []) {
  return (req, res, next) => {
    for (const f of fields) {
      if (req.body?.[f] === undefined || req.body?.[f] === null || req.body?.[f] === "") {
        return res.status(400).json({ error: `Field '${f}' wajib diisi.` });
      }
    }
    next();
  };
}

app.get("/health", (req, res) => {
  res.json({ ok: true, name: "AjarGen" });
});

app.post("/api/ai/cp", requireBody(["form"]), async (req, res) => {
  try {
    const prompt = buildPromptCP(req.body.form);
    const text = await aiText({ prompt, temperature: 0.4 });
    res.json({ ok: true, cp: text.trim() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.post("/api/ai/tp", requireBody(["form"]), async (req, res) => {
  try {
    const prompt = buildPromptTP(req.body.form);
    const text = await aiText({ prompt, temperature: 0.5 });
    res.json({ ok: true, tp: text.trim() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.post("/api/ai/generate", requireBody(["form"]), async (req, res) => {
  try {
    const prompt = buildPromptFull(req.body.form);
    const raw = await aiText({ prompt, temperature: 0.35 });

    // Harus JSON. Kalau AI kebablasan nambah teks, kita coba ekstrak blok JSON.
    const jsonText = extractJson(raw);
    const doc = JSON.parse(jsonText);

    const id = uuidv4();
    store.set(id, { id, createdAt: Date.now(), form: req.body.form, doc });

    res.json({ ok: true, id, doc });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.get("/api/project/:id", (req, res) => {
  const p = store.get(req.params.id);
  if (!p) return res.status(404).json({ ok: false, error: "Project tidak ditemukan." });
  res.json({ ok: true, project: p });
});

app.get("/api/export/docx/:id", async (req, res) => {
  try {
    const p = store.get(req.params.id);
    if (!p) return res.status(404).json({ ok: false, error: "Project tidak ditemukan." });

    const buf = await buildDocxBuffer(p.doc);
    const filename = `AjarGen_${safeName(p.doc?.identitas?.mataPelajaran || "Modul")}_${p.id.slice(0, 8)}.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

function safeName(s) {
  return String(s).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "Modul";
}

function extractJson(text) {
  const s = String(text).trim();
  if (s.startsWith("{")) return s;
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  throw new Error("Output AI bukan JSON. Coba klik Generate lagi atau perbaiki input." );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AjarGen running on http://localhost:${PORT}`);
});
