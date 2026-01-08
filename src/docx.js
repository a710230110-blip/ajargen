import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

const after = (n) => ({ spacing: { after: n } });

function title(text) {
  return new Paragraph({
    text: String(text || ""),
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    ...after(250),
  });
}

function h(text, level = HeadingLevel.HEADING_2) {
  return new Paragraph({ text: String(text || ""), heading: level, ...after(150) });
}

function para(text) {
  return new Paragraph({ children: [new TextRun(String(text || ""))], ...after(160) });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    text: String(text || ""),
    bullet: { level },
    ...after(80),
  });
}

function asArray(x) {
  if (Array.isArray(x)) return x;
  if (!x) return [];
  if (typeof x === "string") return x.split(/\n+/).map((s) => s.replace(/^\d+\.|^-\s?/, "").trim()).filter(Boolean);
  return [String(x)];
}

function identTable(ident = {}) {
  const rows = [
    ["Nama Sekolah", ident.namaSekolah],
    ["Penyusun", ident.penyusun],
    ["Jenjang/Fase", ident.jenjangFase],
    ["Kelas", ident.kelas],
    ["Pertemuan", ident.pertemuan],
    ["Alokasi Waktu", ident.alokasiWaktu],
    ["Mata Pelajaran", ident.mataPelajaran],
    ["Topik/Materi", ident.topik],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (r) =>
        new TableRow({
          children: [
            new TableCell({ children: [para(r[0] || "")], width: { size: 35, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [para(String(r[1] ?? ""))], width: { size: 65, type: WidthType.PERCENTAGE } }),
          ],
        })
    ),
  });
}

export async function buildDocxBuffer(doc) {
  const ident = doc?.identitas || {};
  const kur = doc?.kurikulum || {};

  const children = [];
  children.push(title("AjarGen — Modul Ajar & RPP Otomatis Berbasis AI"));
  children.push(new Paragraph({ text: "", ...after(50) }));

  children.push(h("Identitas", HeadingLevel.HEADING_1));
  children.push(identTable(ident));
  children.push(new Paragraph({ text: "", ...after(200) }));

  children.push(h("Kurikulum & Model Pembelajaran", HeadingLevel.HEADING_1));
  children.push(para(`Tema: ${kur.tema || "-"}`));
  children.push(para(`Model Pembelajaran: ${kur.modelPembelajaran || "-"}`));
  const cat = asArray(kur.catatanPenerapan);
  if (cat.length) {
    children.push(h("Catatan Penerapan", HeadingLevel.HEADING_2));
    cat.forEach((x) => children.push(bulletItem(x)));
  }

  children.push(h("Capaian Pembelajaran (CP)", HeadingLevel.HEADING_1));
  children.push(para(doc?.cp || "-"));

  children.push(h("Tujuan Pembelajaran (TP)", HeadingLevel.HEADING_1));
  asArray(doc?.tp).forEach((x) => children.push(bulletItem(x)));

  children.push(h("Profil Lulusan (Fokus)", HeadingLevel.HEADING_1));
  const profil = asArray(doc?.profil);
  if (profil.length) profil.forEach((x) => children.push(bulletItem(x)));
  else children.push(para("-"));

  children.push(h("Komponen Pembelajaran", HeadingLevel.HEADING_1));
  const kom = doc?.komponen || {};
  children.push(h("Materi", HeadingLevel.HEADING_2));
  asArray(kom.materi).forEach((x) => children.push(bulletItem(x)));
  children.push(h("Media", HeadingLevel.HEADING_2));
  asArray(kom.media).forEach((x) => children.push(bulletItem(x)));
  children.push(h("Sumber", HeadingLevel.HEADING_2));
  asArray(kom.sumber).forEach((x) => children.push(bulletItem(x)));

  children.push(h("Langkah-langkah Pembelajaran", HeadingLevel.HEADING_1));
  const keg = doc?.kegiatan || {};
  children.push(h("Pendahuluan", HeadingLevel.HEADING_2));
  asArray(keg.pendahuluan).forEach((x) => children.push(bulletItem(x)));
  children.push(h("Inti", HeadingLevel.HEADING_2));
  asArray(keg.inti).forEach((x) => children.push(bulletItem(x)));
  children.push(h("Penutup", HeadingLevel.HEADING_2));
  asArray(keg.penutup).forEach((x) => children.push(bulletItem(x)));

  children.push(h("Asesmen", HeadingLevel.HEADING_1));
  const as = doc?.asesmen || {};
  children.push(h("Diagnostik", HeadingLevel.HEADING_2));
  asArray(as.diagnostik).forEach((x) => children.push(bulletItem(x)));
  children.push(h("Formatif", HeadingLevel.HEADING_2));
  asArray(as.formatif).forEach((x) => children.push(bulletItem(x)));
  children.push(h("Sumatif", HeadingLevel.HEADING_2));
  asArray(as.sumatif).forEach((x) => children.push(bulletItem(x)));

  children.push(h("Rubrik Singkat", HeadingLevel.HEADING_1));
  const rub = doc?.rubrikSingkat || {};
  const kriteria = asArray(rub.kriteria);
  if (kriteria.length) {
    children.push(h("Kriteria", HeadingLevel.HEADING_2));
    kriteria.forEach((x) => children.push(bulletItem(x)));
  }
  if (rub.skala) {
    children.push(h("Skala", HeadingLevel.HEADING_2));
    ["4", "3", "2", "1"].forEach((k) => {
      if (rub.skala?.[k]) children.push(bulletItem(`${k}: ${rub.skala[k]}`));
    });
  }

  const document = new Document({
    sections: [{ children }],
  });

  return await Packer.toBuffer(document);
}
