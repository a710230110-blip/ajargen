const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const state = {
  step: 1,
  temaKurikulum: "Deep Learning",
  projectId: null,
  doc: null,
};

const els = {
  panel1: $("#panel1"),
  panel2: $("#panel2"),
  panel3: $("#panel3"),
  barFill: $("#barFill"),
  status: $("#status"),
  preview: $("#preview"),
};

function setStatus(msg, tone = "") {
  els.status.textContent = msg;
  els.status.dataset.tone = tone;
}

function readForm() {
  const profil = $$("#profilChips input[type=checkbox]:checked").map((i) => i.value);
  return {
    namaSekolah: $("#namaSekolah").value,
    penyusun: $("#penyusun").value,
    jenjangFase: $("#jenjangFase").value,
    kelas: $("#kelas").value,
    pertemuan: $("#pertemuan").value,
    alokasiWaktu: $("#alokasiWaktu").value,
    mataPelajaran: $("#mataPelajaran").value,
    topik: $("#topik").value,
    temaKurikulum: state.temaKurikulum,
    modelPembelajaran: $("#modelPembelajaran").value,
    cp: $("#cp").value,
    tp: $("#tp").value,
    profil,
  };
}

function saveLocal() {
  localStorage.setItem("ajargen_form", JSON.stringify(readForm()));
}

function loadLocal() {
  try {
    const raw = localStorage.getItem("ajargen_form");
    if (!raw) return;
    const f = JSON.parse(raw);
    $("#namaSekolah").value = f.namaSekolah || "";
    $("#penyusun").value = f.penyusun || "";
    $("#jenjangFase").value = f.jenjangFase || "";
    $("#kelas").value = f.kelas || "";
    $("#pertemuan").value = f.pertemuan || "";
    $("#alokasiWaktu").value = f.alokasiWaktu || "";
    $("#mataPelajaran").value = f.mataPelajaran || "";
    $("#topik").value = f.topik || "";
    $("#modelPembelajaran").value = f.modelPembelajaran || "";
    $("#cp").value = f.cp || "";
    $("#tp").value = f.tp || "";
    state.temaKurikulum = f.temaKurikulum || state.temaKurikulum;
    $$("#profilChips input[type=checkbox]").forEach((cb) => {
      cb.checked = (f.profil || []).includes(cb.value);
    });
  } catch {}
}

function setTema(tema) {
  state.temaKurikulum = tema;
  $("#temaDeep").classList.toggle("isSelected", tema === "Deep Learning");
  $("#temaCinta").classList.toggle("isSelected", tema === "Kurikulum Berbasis Cinta");
  saveLocal();
}

function setStep(step) {
  state.step = step;
  els.panel1.hidden = step !== 1;
  els.panel2.hidden = step !== 2;
  els.panel3.hidden = step !== 3;

  $$(".step").forEach((s) => {
    s.classList.toggle("isActive", Number(s.dataset.step) === step);
  });

  els.barFill.style.width = step === 1 ? "0%" : step === 2 ? "50%" : "100%";
  saveLocal();
}

function must(v, label) {
  if (!String(v || "").trim()) throw new Error(`${label} wajib diisi.`);
}

function validateStep1() {
  const f = readForm();
  must(f.namaSekolah, "Nama Sekolah");
  must(f.penyusun, "Nama Penyusun");
  must(f.jenjangFase, "Jenjang/Fase");
  must(f.kelas, "Kelas");
  must(f.mataPelajaran, "Mata Pelajaran");
  must(f.topik, "Topik/Materi");
}

async function postJSON(url, body) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.ok === false) {
    throw new Error(data.error || `Request gagal (${resp.status})`);
  }
  return data;
}

function renderPreview(doc) {
  const ident = doc.identitas || {};
  const kur = doc.kurikulum || {};
  const tp = Array.isArray(doc.tp) ? doc.tp : [];
  const profil = Array.isArray(doc.profil) ? doc.profil : [];

  els.preview.innerHTML = `
    <div class="card">
      <div class="card__title">Identitas</div>
      <div class="kv"><span>Nama Sekolah</span><b>${esc(ident.namaSekolah || "-")}</b></div>
      <div class="kv"><span>Penyusun</span><b>${esc(ident.penyusun || "-")}</b></div>
      <div class="kv"><span>Jenjang/Fase</span><b>${esc(ident.jenjangFase || "-")}</b></div>
      <div class="kv"><span>Kelas</span><b>${esc(ident.kelas || "-")}</b></div>
      <div class="kv"><span>Mapel</span><b>${esc(ident.mataPelajaran || "-")}</b></div>
      <div class="kv"><span>Topik</span><b>${esc(ident.topik || "-")}</b></div>
    </div>

    <div class="card">
      <div class="card__title">Kurikulum</div>
      <div class="kv"><span>Tema</span><b>${esc(kur.tema || "-")}</b></div>
      <div class="kv"><span>Model</span><b>${esc(kur.modelPembelajaran || "-")}</b></div>
    </div>

    <div class="card">
      <div class="card__title">CP</div>
      <div class="mono">${esc(doc.cp || "-")}</div>
    </div>

    <div class="card">
      <div class="card__title">TP</div>
      <ul class="list">${tp.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </div>

    <div class="card">
      <div class="card__title">Profil (Fokus)</div>
      <div class="tags">${profil.length ? profil.map((x) => `<span class="tag">${esc(x)}</span>`).join("") : "-"}</div>
    </div>

    <div class="card">
      <div class="card__title">JSON Lengkap</div>
      <pre class="pre">${esc(JSON.stringify(doc, null, 2))}</pre>
    </div>
  `;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>\"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

// ---------- events ----------
$("#year").textContent = new Date().getFullYear();

$("#btnDemo").addEventListener("click", () => {
  $("#namaSekolah").value = "SMK Negeri 1 Contoh";
  $("#penyusun").value = "Arahendra Yoga Prawira";
  $("#jenjangFase").value = "SMK / Fase E";
  $("#kelas").value = "X";
  $("#pertemuan").value = "2";
  $("#alokasiWaktu").value = "2 x 45 menit";
  $("#mataPelajaran").value = "Informatika";
  $("#topik").value = "Algoritma Dasar";
  $("#modelPembelajaran").value = "Problem Based Learning (PBL)";
  setTema("Deep Learning");
  saveLocal();
  setStatus("Contoh diisi.");
});

$("#btnReset").addEventListener("click", () => {
  localStorage.removeItem("ajargen_form");
  location.reload();
});

$$("input, select, textarea").forEach((el) => el.addEventListener("input", saveLocal));

$("#temaDeep").addEventListener("click", () => setTema("Deep Learning"));
$("#temaCinta").addEventListener("click", () => setTema("Kurikulum Berbasis Cinta"));

$("#toStep2").addEventListener("click", () => {
  try { validateStep1(); setStep(2); }
  catch (e) { setStatus(e.message, "bad"); }
});
$("#toStep3").addEventListener("click", () => setStep(3));
$("#back1").addEventListener("click", () => setStep(1));
$("#back2").addEventListener("click", () => setStep(2));

$$(".step").forEach((s) => s.addEventListener("click", () => {
  const t = Number(s.dataset.step);
  if (t === 2 || t === 3) {
    try { validateStep1(); }
    catch (e) { setStatus(e.message, "bad"); return; }
  }
  setStep(t);
}));

$("#btnCP").addEventListener("click", async () => {
  try {
    validateStep1();
    setStatus("Membuat CP dengan AI...", "wait");
    $("#btnCP").disabled = true;
    const data = await postJSON("/api/ai/cp", { form: readForm() });
    $("#cp").value = data.cp;
    saveLocal();
    setStatus("CP selesai dibuat.", "ok");
  } catch (e) {
    setStatus(e.message, "bad");
  } finally {
    $("#btnCP").disabled = false;
  }
});

$("#btnTP").addEventListener("click", async () => {
  try {
    validateStep1();
    setStatus("Membuat TP dengan AI...", "wait");
    $("#btnTP").disabled = true;
    const data = await postJSON("/api/ai/tp", { form: readForm() });
    $("#tp").value = data.tp;
    saveLocal();
    setStatus("TP selesai dibuat.", "ok");
  } catch (e) {
    setStatus(e.message, "bad");
  } finally {
    $("#btnTP").disabled = false;
  }
});

$("#btnGenerate").addEventListener("click", async () => {
  try {
    validateStep1();
    const f = readForm();
    if (!String(f.cp || "").trim()) throw new Error("CP masih kosong. Klik 'Buatkan Otomatis (AI)' atau isi manual.");
    if (!String(f.tp || "").trim()) throw new Error("TP masih kosong. Klik 'Buatkan Otomatis (AI)' atau isi manual.");

    setStatus("Generate dokumen...", "wait");
    $("#btnGenerate").disabled = true;
    $("#btnExport").disabled = true;

    const data = await postJSON("/api/ai/generate", { form: f });
    state.projectId = data.id;
    state.doc = data.doc;

    renderPreview(state.doc);
    $("#btnExport").disabled = false;
    setStatus("Selesai. Kamu bisa unduh DOCX.", "ok");
  } catch (e) {
    setStatus(e.message, "bad");
  } finally {
    $("#btnGenerate").disabled = false;
  }
});

$("#btnExport").addEventListener("click", () => {
  if (!state.projectId) return;
  window.open(`/api/export/docx/${state.projectId}`, "_blank");
});

$("#copyJson").addEventListener("click", async () => {
  try {
    if (!state.doc) throw new Error("Belum ada hasil generate.");
    await navigator.clipboard.writeText(JSON.stringify(state.doc, null, 2));
    setStatus("JSON disalin ke clipboard.", "ok");
  } catch (e) {
    setStatus(e.message, "bad");
  }
});

// init
loadLocal();
setTema(state.temaKurikulum);
setStep(1);
setStatus("Siap.");
