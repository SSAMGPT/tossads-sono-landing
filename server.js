const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PRODUCTS_FILE = path.join(ROOT, 'products.json');
const IMG_DIR       = path.join(ROOT, 'img');

// ── 이미지 업로드 설정 ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMG_DIR),
  filename:    (req, file, cb) => {
    // 원본 파일명 그대로 저장 (한글 포함)
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// ── 미들웨어 ────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(ROOT));   // 정적 파일 서빙 (index.html, css, js 등)

// ── API: 제품 목록 조회 ─────────────────────────────────────
app.get('/api/products', (req, res) => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.json({ '330X2': [], '330X3': [], '330X4': [], '330X6': [] });
  }
});

// ── API: 제품 목록 저장 ─────────────────────────────────────
app.post('/api/products', (req, res) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── API: 이미지 업로드 ──────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: '파일 없음' });
  // 저장된 파일명 반환 (img/ 경로 포함)
  const savedName = req.file.filename;
  res.json({ ok: true, filename: savedName, path: `img/${savedName}` });
});

// ── API: 이미지 목록 조회 ───────────────────────────────────
app.get('/api/images', (req, res) => {
  try {
    const exts = ['.jpg', '.jpeg', '.png', '.avif', '.webp', '.jfif', '.gif'];
    const files = fs.readdirSync(IMG_DIR)
      .filter(f => exts.includes(path.extname(f).toLowerCase()))
      .map(f => ({ name: f, path: `img/${f}` }));
    res.json(files);
  } catch (e) {
    res.json([]);
  }
});

// ── 서버 시작 ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ 서버 실행 중!`);
  console.log(`   랜딩 페이지:  http://localhost:${PORT}`);
  console.log(`   어드민 패널:  http://localhost:${PORT}/admin.html\n`);
});
