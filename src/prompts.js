function val(x, fallback = "") {
  return (x ?? fallback).toString().trim();
}

export function buildPromptCP(form) {
  const mp = val(form.mataPelajaran);
  const topik = val(form.topik);
  const jenjangFase = val(form.jenjangFase);
  const kelas = val(form.kelas);
  const model = val(form.modelPembelajaran, "");

  return `TULISKAN CAPAIAN PEMBELAJARAN (CP) BAHASA INDONESIA.

Konteks:
- Mata pelajaran: ${mp}
- Topik/materi: ${topik}
- Jenjang/Fase: ${jenjangFase}
- Kelas: ${kelas}
- Model pembelajaran: ${model}

Aturan:
- Panjang 4–8 kalimat.
- Fokus kompetensi pengetahuan + keterampilan.
- Jangan menyebut "sebagai AI".
- Tulis rapi dalam 1 paragraf.`;
}

export function buildPromptTP(form) {
  const mp = val(form.mataPelajaran);
  const topik = val(form.topik);
  const jenjangFase = val(form.jenjangFase);
  const kelas = val(form.kelas);

  return `TULISKAN TUJUAN PEMBELAJARAN (TP) BAHASA INDONESIA.

Konteks:
- Mata pelajaran: ${mp}
- Topik/materi: ${topik}
- Jenjang/Fase: ${jenjangFase}
- Kelas: ${kelas}

Aturan:
- Buat 4–7 butir.
- Setiap butir diawali kata kerja operasional (mis. mengidentifikasi, menjelaskan, menerapkan, menganalisis, membuat).
- Format: list bernomor (1., 2., 3., ...).
- Jangan menyebut "sebagai AI".`;
}

export function buildPromptFull(form) {
  const ident = {
    namaSekolah: val(form.namaSekolah),
    penyusun: val(form.penyusun),
    jenjangFase: val(form.jenjangFase),
    kelas: val(form.kelas),
    pertemuan: val(form.pertemuan),
    alokasiWaktu: val(form.alokasiWaktu),
    mataPelajaran: val(form.mataPelajaran),
    topik: val(form.topik),
  };

  const tema = val(form.temaKurikulum);
  const model = val(form.modelPembelajaran);
  const cp = val(form.cp);
  const tp = val(form.tp);
  const profil = Array.isArray(form.profil) ? form.profil : [];

  return `Kamu akan membuat DOKUMEN MODUL AJAR & RPP berbahasa Indonesia.

WAJIB: output HARUS JSON VALID saja (tanpa teks lain, tanpa markdown).

Masukan (data user):
${JSON.stringify({ identitas: ident, kurikulum: { tema, modelPembelajaran: model }, cp, tp, profil }, null, 2)}

Format JSON yang harus kamu keluarkan (ikuti struktur & nama field persis):
{
  "identitas": {
    "namaSekolah": "...",
    "penyusun": "...",
    "jenjangFase": "...",
    "kelas": "...",
    "pertemuan": "...",
    "alokasiWaktu": "...",
    "mataPelajaran": "...",
    "topik": "..."
  },
  "kurikulum": {
    "tema": "Deep Learning | Kurikulum Berbasis Cinta | lainnya",
    "modelPembelajaran": "...",
    "catatanPenerapan": ["...", "..."]
  },
  "cp": "...",
  "tp": ["...", "..."],
  "profil": ["..."],
  "komponen": {
    "materi": ["..."],
    "media": ["..."],
    "sumber": ["..."]
  },
  "kegiatan": {
    "pendahuluan": ["..."],
    "inti": ["..."],
    "penutup": ["..."]
  },
  "asesmen": {
    "diagnostik": ["..."],
    "formatif": ["..."],
    "sumatif": ["..."]
  },
  "rubrikSingkat": {
    "kriteria": ["Kriteria 1", "Kriteria 2", "Kriteria 3"],
    "skala": {
      "4": "Sangat baik ...",
      "3": "Baik ...",
      "2": "Cukup ...",
      "1": "Perlu bimbingan ..."
    }
  }
}

Aturan kualitas:
- Isi harus sesuai input.
- RPP ringkas tapi lengkap.
- Bahasa baku, jelas, bisa langsung dipakai.
- Buat poin kegiatan realistis (minimal 4 poin inti).
- Jangan mengarang kebijakan/nomor peraturan.`;
}
