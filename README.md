# AjarGen — Modul Ajar & RPP Otomatis Berbasis AI

Web wizard 3 langkah (mirip prototype video) tapi **beda style**.

## Fitur
- Step 1: Identitas (sekolah, penyusun, fase, kelas, mapel, topik, dll)
- Step 2: Detail (tema kurikulum, model pembelajaran, tombol AI untuk CP & TP)
- Step 3: Generate (output JSON + tombol **Unduh DOCX**)

## Menjalankan (lokal)
1. Install Node.js (versi 18+)
2. Buka folder proyek ini
3. Jalankan:
   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```
4. Buka: `http://localhost:3000`

> Default `AI_PROVIDER=mock` (demo tanpa API key). Kalau mau pakai AI sungguhan, ubah `.env`.

## Pakai AI Provider
- **OpenAI**: set `AI_PROVIDER=openai` + isi `OPENAI_API_KEY` (+ model kalau perlu)
- **Gemini**: set `AI_PROVIDER=gemini` + isi `GEMINI_API_KEY`

Kode konektornya ada di `src/ai.js` (bisa kamu sesuaikan kalau endpoint/model kamu beda).

## Catatan
- Output step 3 sengaja dibuat **JSON terstruktur** supaya gampang diedit/diolah.
- Export DOCX memakai library `docx`.
