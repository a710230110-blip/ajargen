/**
 * AjarGen AI connector
 *
 * Pilih provider via .env:
 *  - AI_PROVIDER=openai | gemini | mock
 *
 * Catatan: ini template yang praktis. Kalau endpoint/provider kamu beda,
 * tinggal sesuaikan di file ini.
 */

export async function aiText({ prompt, temperature = 0.4 }) {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "mock") {
    // Untuk demo tanpa API key
    return mockAnswer(prompt);
  }

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY belum diisi di .env");

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    // Pakai endpoint yang paling umum (Chat Completions) agar kompatibel.
    const resp = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: "system", content: "Kamu asisten AI pendidikan yang menulis dokumen modul ajar dan RPP berbahasa Indonesia." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`OpenAI error ${resp.status}: ${t}`);
    }
    const data = await resp.json();
    const out = data?.choices?.[0]?.message?.content;
    if (!out) throw new Error("OpenAI response kosong.");
    return out;
  }

  if (provider === "gemini") {
    // Template Gemini. Sesuaikan endpoint sesuai dokumentasi yang kamu pakai.
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY belum diisi di .env");

    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const url = process.env.GEMINI_URL || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Gemini error ${resp.status}: ${t}`);
    }
    const data = await resp.json();
    const out = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    if (!out.trim()) throw new Error("Gemini response kosong.");
    return out;
  }

  throw new Error(`AI_PROVIDER tidak dikenal: ${provider}`);
}

function mockAnswer(prompt) {
  if (prompt.includes("CAPAIAN PEMBELAJARAN")) {
    return "Peserta didik memahami konsep dasar ... (contoh output mock)";
  }
  if (prompt.includes("TUJUAN PEMBELAJARAN")) {
    return "Setelah pembelajaran, peserta didik mampu ... (contoh output mock)";
  }
  return JSON.stringify({
    identitas: {
      namaSekolah: "SMA Contoh",
      penyusun: "Guru",
      jenjangFase: "SMA/Fase E",
      kelas: "X",
      pertemuan: "2",
      alokasiWaktu: "2 x 45 menit",
      mataPelajaran: "Informatika",
      topik: "Algoritma Dasar"
    },
    kurikulum: { tema: "Deep Learning", modelPembelajaran: "Problem Based Learning (PBL)" },
    cp: "(mock) ...",
    tp: ["(mock) ..."],
    profil: ["Bernalar kritis", "Mandiri"],
    komponen: {
      materi: ["(mock)"],
      media: ["Laptop", "Proyektor"],
      sumber: ["Buku teks", "Sumber daring"]
    },
    kegiatan: {
      pendahuluan: ["Apersepsi", "Motivasi"],
      inti: ["Eksplorasi", "Diskusi"],
      penutup: ["Refleksi", "Kesimpulan"]
    },
    asesmen: {
      diagnostik: ["Tanya jawab singkat"],
      formatif: ["Kuis"],
      sumatif: ["Proyek mini"]
    }
  }, null, 2);
}
