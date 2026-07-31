# Product Requirements Document (PRD)

## AI-Powered Spatial Decision Support System for Transit-Oriented Development (TOD) Assessment — Kota Yogyakarta

**Versi:** 0.1 (Draft Proposal)
**Tanggal:** 14 Juli 2026
**Kompetisi:** MAPID WebGIS Competition 2026 — Mass Transportation Edition
**Tim:** [Nama Tim]

---

## 1. Ringkasan Produk

### 1.1 Nama Produk (Working Title)
**TODex Jogja** — Transit-Oriented Development Index & Decision Support untuk Kota Yogyakarta.

### 1.2 Deskripsi Singkat
WebGIS interaktif berbasis AI yang mengevaluasi kualitas implementasi TOD di sekitar simpul transit Kota Yogyakarta (halte Trans Jogja, stasiun KRL/KA, terminal) menggunakan framework 6D (Density, Diversity, Design, Destination Accessibility, Distance to Transit, Demand Management), diperkaya data lapangan via MAPID Apps, data Community Maps MAPID, dan pengalaman pengguna (crowdsourced). Output utama adalah **TOD Performance Index**, identifikasi **problem hotspot**, dan **rekomendasi prioritas pengembangan kawasan** yang dihasilkan oleh AI insight engine — dengan konteks budaya-pariwisata Yogyakarta sebagai context modifier.

### 1.3 Value Proposition
Bukan sekadar peta, melainkan sistem pendukung keputusan: dari data mentah (spasial + foto + narasi pengguna) → indeks terukur → penjelasan penyebab → rekomendasi intervensi yang bisa langsung dipakai pemerintah daerah dan operator transportasi.

---

## 2. Latar Belakang & Rumusan Masalah

### 2.1 Masalah
Yogyakarta memiliki jaringan transportasi massal yang berkembang (Trans Jogja, KRL Jogja–Solo, KA Bandara YIA), namun perubahan perilaku mobilitas masyarakat belum mengikuti — penggunaan kendaraan pribadi tetap tinggi. Hipotesis utama: **kualitas kawasan di sekitar simpul transit tidak mendukung** — walkability rendah, konektivitas antarmoda buruk, guna lahan tidak mendukung aktivitas tanpa kendaraan pribadi.

### 2.2 Gap yang Diisi
1. Evaluasi TOD selama ini didominasi indikator fisik/spasial konvensional; pengalaman nyata pengguna (foto lapangan, review, keluhan) belum terintegrasi.
2. Hasil evaluasi biasanya berhenti di peta/skor statis; tidak ada mekanisme yang menerjemahkan skor menjadi rekomendasi intervensi yang dapat ditindaklanjuti.
3. Konteks khas Yogyakarta (kawasan heritage, pola mobilitas wisatawan) belum dipertimbangkan dalam evaluasi TOD generik.

### 2.3 Pertanyaan Kunci yang Dijawab Produk
- Seberapa baik performa TOD di tiap kawasan simpul transit Kota Yogyakarta?
- Dimensi apa yang menjadi kelemahan dominan di tiap kawasan, dan apa penyebabnya di lapangan?
- Kawasan mana yang harus diprioritaskan untuk intervensi, dan intervensi seperti apa?

---

## 3. Pengguna & Persona

| Persona | Kebutuhan | Cara Pakai Produk |
|---|---|---|
| **Perencana Pemda (Bappeda/Dinas PUPR-Tata Ruang DIY & Kota Yogyakarta)** | Basis bukti untuk prioritas anggaran pengembangan kawasan transit | Melihat TOD Index, priority area, membaca AI recommendation per kawasan |
| **Operator Transportasi (Dishub DIY / Trans Jogja / KAI–KAI Commuter)** | Memahami kualitas first/last mile di sekitar halte/stasiun | Filter per simpul, cek Design & Accessibility score, problem hotspot |
| **Peneliti / Mahasiswa Perencanaan** | Data & metode evaluasi TOD yang dapat direplikasi | Eksplorasi layer, spatial query, unduh ringkasan metadata |
| **Publik / Komunitas Pejalan Kaki & Transportasi** | Menyuarakan kondisi lapangan, melihat kondisi kawasannya | Melihat peta walkability, insight kawasan, kontribusi data lapangan |

**Primary persona:** Perencana pemda — produk dirancang sebagai decision support, bukan alat navigasi publik.

---

## 4. Ruang Lingkup

### 4.1 Wilayah Studi
Kota Yogyakarta + kawasan aglomerasi fungsional di sekitar simpul utama (Stasiun Tugu, Stasiun Lempuyangan, Terminal Giwangan, koridor utama Trans Jogja). Simpul di luar batas administrasi kota (mis. Stasiun Maguwo) dipertimbangkan bila relevan dengan koridor.

### 4.2 Unit Analisis
- **Catchment area simpul transit:** radius jalan (network-based) 400 m dan 800 m dari tiap halte/stasiun/terminal.
- **Grid heksagonal (H3 resolusi 9–10)** untuk agregasi indikator dan visualisasi indeks yang seragam.

### 4.3 In-Scope
- Evaluasi 6D + TOD Performance Index untuk ± 20–40 simpul transit terpilih (halte koridor utama + seluruh stasiun & terminal).
- Survei lapangan via MAPID Apps (foto, kondisi trotoar, fasilitas).
- Analisis AI: computer vision (foto lapangan), NLP (review/laporan), priority ranking, recommendation engine.
- WebGIS publik di atas MAPID MAPS + GEO MAPID dengan fitur AI insight panel.

### 4.4 Out-of-Scope (v1)
- Prediksi ridership real-time / integrasi GTFS live.
- Simulasi lalu lintas mikroskopik.
- Aplikasi mobile native (WebGIS responsif saja).

---

## 5. Data

### 5.1 Data Wajib Kompetisi
| Data | Sumber | Peran |
|---|---|---|
| Community Maps MAPID (Menu Go, Property Go, Struk Go, community activity) | MAPID Apps / panitia | Proxy aktivitas ekonomi & diversity kawasan (UMKM, kuliner, properti) |
| Survey activity lapangan | MAPID Apps (form dibuat tim) | Data Design: kondisi trotoar, penyeberangan, peneduh, street furniture, foto geotagged |
| Basemap & platform | MAPID MAPS, GEO MAPID | Basemap utama & pengelolaan data spasial |

### 5.2 Data Pendukung (legal, sumber jelas)
| Data | Sumber | Dimensi |
|---|---|---|
| Jaringan jalan & pedestrian | OpenStreetMap | Design, Accessibility, Distance |
| Halte, stasiun, terminal | OSM + Dishub DIY + validasi lapangan | Distance to Transit |
| Tata guna lahan / bangunan | RTRW/RDTR (tataruang.atrbpn.go.id), OSM buildings, Open Buildings | Density, Diversity |
| Kepadatan penduduk | BPS (kelurahan), WorldPop/GHSL | Density |
| POI & fasilitas publik | OSM, data terbuka pemda, Community Maps | Diversity, Accessibility |
| Google Review halte/stasiun & sekitarnya | Google Maps (kutipan terbatas, agregasi) | User experience (NLP) |
| Laporan masyarakat / media sosial publik | Kanal resmi/publik, dikurasi manual | User experience (NLP) |
| Batas administrasi | BIG / GADM | Referensi |

### 5.3 Rencana Survei Lapangan (Wajib)
- **Instrumen:** 1 survey activity di MAPID Apps dengan form terstruktur: segmen trotoar (lebar, material, kondisi, hambatan), fasilitas penyeberangan, peneduh/vegetasi, penerangan, parkir liar, akses difabel + minimal 2 foto per titik.
- **Sampling:** seluruh segmen jalan utama dalam radius 400 m dari 20–40 simpul terpilih; target ± 400–800 titik observasi.
- **Tim & waktu:** 3–5 surveyor, 6–8 hari lapangan pada minggu ke-1–2 periode pengembangan (Agustus 2026), menggunakan survey activity budget.
- **QC:** validasi geotag, kelengkapan foto, double-check 10% sampel oleh anggota berbeda.

---

## 6. Metodologi Analisis

### 6.1 Framework 6D → Skor per Dimensi
Semua analisis spasial menggunakan **tools open-source** (QGIS, PostGIS, Python: GeoPandas/OSMnx/scikit-learn; ArcGIS tidak digunakan).

| Dimensi | Indikator Utama | Metode |
|---|---|---|
| Density | Kepadatan penduduk, kepadatan bangunan, building coverage | Zonal statistics per hexagon/catchment |
| Diversity | Entropy index guna lahan, kepadatan & keragaman POI/UMKM (Community Maps) | Land-use entropy, POI mix ratio |
| Design | Skor walkability: kondisi trotoar, penyeberangan, peneduh, street furniture, akses difabel | Survei lapangan + computer vision pada foto; skor per segmen jalan |
| Destination Accessibility | Jumlah destinasi terjangkau dalam 15 menit jalan kaki/transit | Network analysis & isochrone (OSMnx / OpenRouteService) |
| Distance to Transit | Jarak jaringan ke simpul terdekat, cakupan catchment | Network buffer 400/800 m |
| Demand Management | Proxy ketergantungan kendaraan pribadi: luas lahan parkir, rasio jalan vs pedestrian, ketersediaan park-and-ride | Interpretasi citra + OSM + observasi lapangan |

Normalisasi: min–max per indikator → skor 0–100 per dimensi.

### 6.2 TOD Performance Index
- **Pembobotan:** AHP (expert judgment: dosen perencanaan/transportasi + praktisi) dikombinasikan entropy weighting sebagai pembanding objektif; sensitivity analysis dilaporkan.
- **Agregasi:** weighted sum per hexagon → agregasi per catchment simpul.
- **Klasifikasi:** 5 kelas (Sangat Baik – Sangat Kurang), plus tipologi simpul via clustering (node–place model).

### 6.3 Context Modifier Budaya–Pariwisata
Kawasan heritage/wisata (Malioboro, Kraton, Kotagede, dsb. — dari delineasi resmi kawasan cagar budaya) tidak mengubah skor 6D, tetapi mengubah **jenis rekomendasi** (mis. prioritas pedestrianisasi & pengelolaan wisatawan, bukan densifikasi). Diimplementasikan sebagai rule layer dalam recommendation engine.

---

## 7. Komponen AI (Input → Proses → Output → Validasi)

> Sesuai ketentuan kompetisi: AI wajib hadir dalam interface, metode wajib dijelaskan dan divalidasi.

### 7.1 Computer Vision — Walkability dari Foto Lapangan
- **Input:** foto geotagged survei MAPID Apps (+ opsional citra street-level Mapillary/KartaView).
- **Proses:** semantic segmentation (model pre-trained mis. SegFormer/DeepLabv3+ pada Cityscapes/Mapillary Vistas, fine-tune ringan) untuk proporsi trotoar–vegetasi–kendaraan; klasifikasi kondisi trotoar (baik/rusak/tidak ada) dengan CNN ringan atau vision LLM berlabel few-shot.
- **Output:** skor kondisi per segmen jalan → input Design Score.
- **Validasi:** confusion matrix vs label manual surveyor pada 15–20% sampel; target akurasi ≥ 80%.

### 7.2 NLP — Pengalaman Pengguna
- **Input:** Google Review simpul transit, laporan masyarakat, catatan naratif surveyor.
- **Proses:** aspect-based sentiment & topic classification menggunakan IndoBERT (fine-tune ringan) atau LLM dengan few-shot prompting; aspek: keamanan, kenyamanan, kebersihan, akses, informasi, konektivitas.
- **Output:** peta isu dominan per simpul + skor UX yang melengkapi dimensi Design/Accessibility.
- **Validasi:** inter-annotator agreement pada sampel berlabel manual (≥ 100 teks), Cohen's kappa dilaporkan.

### 7.3 Priority Ranking & Recommendation Engine
- **Input:** skor 6D, TOD Index, isu dominan NLP, context modifier, kepadatan pengguna.
- **Proses:** rule-based prioritization (skor rendah × exposure tinggi = prioritas tinggi) + LLM (RAG di atas hasil analisis terstruktur) untuk menghasilkan narasi rekomendasi yang dapat dijelaskan; LLM tidak menghitung skor, hanya menarasikan dan memilih template intervensi.
- **Output:** daftar Priority Development Area, rekomendasi intervensi per kawasan, penjelasan "mengapa skor rendah".
- **Validasi:** review pakar (dosen/praktisi) terhadap 10 rekomendasi sampel; uji konsistensi (pertanyaan sama → jawaban konsisten).

### 7.4 AI di Interface WebGIS
- **Insight Panel:** klik simpul/hexagon → ringkasan AI: skor, kelemahan dominan, penyebab, rekomendasi.
- **Smart Query (natural language):** "halte mana yang walkability-nya paling buruk di koridor 1?" → dijawab dari data terstruktur (text-to-query terbatas, bukan chatbot bebas).
- **Auto-Summary:** ringkasan kondisi TOD kota satu klik untuk pengambil keputusan.

---

## 8. Fitur Produk & User Flow

### 8.1 Fitur (MoSCoW)
| Prioritas | Fitur |
|---|---|
| **Must** | Peta interaktif MAPID MAPS (zoom, klik objek, layer control, filter, pencarian lokasi); layer TOD Index & 6 skor dimensi; catchment & isochrone; AI Insight Panel per simpul; halaman metodologi & metadata; responsif desktop–mobile |
| **Should** | Smart query natural language; dashboard perbandingan antar simpul; problem hotspot & opportunity area; unduh ringkasan PDF per kawasan |
| **Could** | Mode storytelling (scrollytelling narasi masalah→solusi); form partisipasi publik ringan |
| **Won't (v1)** | Chatbot bebas, data real-time, akun pengguna |

### 8.2 User Flow Utama (Perencana)
1. Buka WebGIS → landing dengan peta TOD Index kota + ringkasan AI.
2. Filter koridor/jenis simpul → pilih satu simpul.
3. Panel detail: radar chart 6D, foto lapangan, isu dominan dari review.
4. Klik "AI Recommendation" → prioritas intervensi + penjelasan.
5. Bandingkan simpul / unduh ringkasan → bahan rapat perencanaan.

---

## 9. Arsitektur & Persyaratan Teknis

### 9.1 Stack
- **Analisis (open-source, wajib):** QGIS, PostGIS/PostgreSQL, Python (GeoPandas, OSMnx, scikit-learn, PyTorch/transformers), Google Earth Engine bila perlu.
- **Data platform:** GEO MAPID (hosting & pengelolaan layer), format GeoJSON/GeoPackage.
- **Frontend:** React + MapLibre GL JS di atas **MAPID MAPS basemap**; deploy ke subdomain finalis.
- **Backend ringan:** FastAPI (endpoint insight/AI), atau pre-computed JSON bila memungkinkan (hemat biaya & latensi).
- **AI serving:** hasil CV/NLP di-precompute (batch); LLM insight via API dengan guardrail (jawaban hanya dari data terstruktur).

### 9.2 Non-Functional
- Dapat diakses publik, stabil selama penjurian; waktu muat awal < 5 detik pada koneksi 4G.
- Responsif desktop & mobile.
- Seluruh layer memuat metadata & sumber; data mentah MAPID tidak disebarluaskan.
- Metode reproducible: notebook analisis terdokumentasi.

---

## 10. Metrik Keberhasilan

| Aspek | Metrik | Target |
|---|---|---|
| Akurasi CV | Akurasi klasifikasi kondisi trotoar vs label manual | ≥ 80% |
| Akurasi NLP | F1 klasifikasi aspek/sentimen | ≥ 0,75 |
| Kualitas rekomendasi | Rating kelayakan oleh ≥ 2 pakar (skala 1–5) | ≥ 4 |
| Cakupan survei | Titik observasi terkumpul | ≥ 400 titik |
| Performa WebGIS | Uptime saat penjurian; load time | 100%; < 5 dtk |
| Kegunaan | Uji coba dengan ≥ 3 calon pengguna (Dishub/Bappeda/dosen) | Feedback terdokumentasi |

---

## 11. Timeline (mengikuti timeline kompetisi)

| Periode | Kegiatan |
|---|---|
| s.d. 27 Jul 2026 | Finalisasi proposal & submit |
| 5 Agu 2026 | Pengumuman Top 50 |
| Minggu 1–2 (7–20 Agu) | Setup GEO MAPID, desain form survei, **survei lapangan**, kumpulkan data sekunder |
| Minggu 3–4 (21 Agu–3 Sep) | Analisis spasial 6D, training/validasi CV & NLP, penyusunan TOD Index |
| Minggu 5 (4–10 Sep) | Recommendation engine, pembangunan WebGIS & fitur AI |
| Minggu 6 (11–14 Sep) | Uji pengguna, perbaikan, dokumentasi, **submission final 14 Sep** |
| 18–23 Sep | Persiapan presentasi & final showcase |

---

## 12. Tim & Peran

| Peran | Tanggung Jawab |
|---|---|
| Project Leader | Koordinasi, timeline, komunikasi panitia, PRD |
| WebGIS Developer | Frontend MapLibre + MAPID MAPS, integrasi GEO MAPID, deployment |
| Data & AI Analyst | Analisis spasial 6D, CV/NLP, TOD Index, validasi |
| UI/UX Designer | Wireframe, dashboard, responsivitas, storytelling visual |
| Business/Product Analyst | Validasi kebutuhan pengguna (wawancara Dishub/Bappeda), narasi & presentasi |

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Akses/legalitas data review & sosmed | Analisis NLP terhambat | Prioritaskan laporan surveyor & kanal resmi; kutip agregat, bukan teks mentah; cantumkan sumber |
| Akurasi CV rendah karena foto beragam | Design Score bias | SOP foto seragam di form survei; fallback ke skor manual surveyor |
| Cakupan survei tak tercapai (cuaca/waktu) | Data Design tidak lengkap | Prioritaskan simpul strategis (bertahap 20 → 40); jadwal cadangan |
| Data guna lahan resmi sulit diakses | Diversity kurang presisi | Proxy dari OSM + POI + Community Maps, dinyatakan sebagai limitasi |
| LLM menghasilkan rekomendasi tidak berdasar | Kredibilitas turun | RAG ketat hanya dari data terstruktur; template intervensi terkurasi; review pakar |
| Beban server saat penjurian | WebGIS lambat | Pre-compute hasil, tiling vektor, caching |

---

## 14. Deliverables Final (sesuai ketentuan)
1. Link WebGIS publik (subdomain finalis, basemap MAPID MAPS).
2. PRD final (dokumen ini, diperbarui).
3. Metadata seluruh dataset + metode pengolahan data.
4. Dokumentasi survey activities & penggunaan survey activity budget.
5. Penjelasan penggunaan AI (input–proses–output–validasi).
6. Slide presentasi final (6 menit + 4 menit Q&A).

---

*Catatan: angka target (jumlah simpul, titik survei, threshold akurasi) bersifat estimasi awal dan akan dikalibrasi setelah akses data Top 50 diberikan.*
