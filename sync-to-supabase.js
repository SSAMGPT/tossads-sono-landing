/**
 * sync-to-supabase.js
 * 로컬 가전 제품 데이터를 Supabase에 동기화합니다.
 * 실행: node sync-to-supabase.js
 */

const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rbliwhiibewihqlpmihd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_n0rEJFTn6Qu12Ui_qDO8bw_sSVJbTR-';
const BUCKET = 'product-images';
const TABLE  = 'products';

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── 로컬 제품 목록 (HTML의 data-* 속성 기준) ──────────────────────
const LOCAL_PRODUCTS = [
  // 330X2
  { plan:'330X2', name:'LG 공기청정기',  full_name:'LG 퓨리케어 공기청정기 (AS305DWWA)',        brand:'LG',       category:'공기청정기', localImg:'img/스마트케어330x2_lg_공기청정기_AS305DWWA.jpg' },
  { plan:'330X2', name:'LG 정수기',      full_name:'LG 퓨리케어 정수기 (WD220MCB)',              brand:'LG',       category:'정수기',     localImg:'img/스마트케어330x2_LG_정수기_WD220MCB.avif' },
  { plan:'330X2', name:'SK 정수기',      full_name:'SK매직 스스로 직수 정수기 (WPUIAC414SPS)',   brand:'기타',     category:'정수기',     localImg:'img/스마트케어330x2_SK_정수기_WPUIAC414SPS.png' },

  // 330X3
  { plan:'330X3', name:'LG 공기청정기',  full_name:'LG 퓨리케어 공기청정기 (AS355NSNA)',        brand:'LG',       category:'공기청정기', localImg:'img/스마트케어330x3_lg_공기청정기_AS355NSNA.jpg' },
  { plan:'330X3', name:'LG 냉장고',      full_name:'LG 디오스 냉장고 (S836MRQ112)',              brand:'LG',       category:'냉장고',     localImg:'img/스마트케어330x3_LG_냉장고_S836MRQ112.avif' },
  { plan:'330X3', name:'LG TV',          full_name:'LG 올레드 TV (OLED55B5KNA)',                 brand:'LG',       category:'TV',         localImg:'img/스마트케어330x3_LG_TV_OLED55B5KNA.avif' },

  // 330X4
  { plan:'330X4', name:'LG 건조기',      full_name:'LG 트롬 건조기 (Z509MHHF23)',               brand:'LG',       category:'세탁기',     localImg:'img/스마트케어330x4_LG_건조기_Z509MHHF23.avif' },
  { plan:'330X4', name:'LG 냉장고',      full_name:'LG 디오스 냉장고 (Z509MHHF23)',              brand:'LG',       category:'냉장고',     localImg:'img/스마트케어330x4_LG_냉장고_Z509MHHF23.avif' },
  { plan:'330X4', name:'LG 로봇청소기',  full_name:'LG 코드제로 로봇청소기 (B95AWBH)',          brand:'LG',       category:'청소기',     localImg:'img/스마트케어330x4_LG_로봇청소기_B95AWBH.jpg' },
  { plan:'330X4', name:'LG 에어컨',      full_name:'LG 휘센 에어컨 (FQ18HDWHY2)',               brand:'LG',       category:'에어컨',     localImg:'img/스마트케어330x4_lg_에어컨_FQ18HDWHY2.jpg' },

  // 330X6
  { plan:'330X6', name:'바디프랜드',     full_name:'바디프랜드 안마의자 (BFR-7211)',             brand:'바디프렌드',category:'안마의자',   localImg:'img/스마트케어330x6_바디프렌드_안마의자_BFR-7211.jpg' },
  { plan:'330X6', name:'삼성 냉장고',    full_name:'삼성 비스포크 냉장고 (RM80F91K1XJ)',         brand:'삼성',     category:'냉장고',     localImg:'img/스마트케어330x6_삼성_냉장고_RM80F91K1XJ.jfif' },
  { plan:'330X6', name:'세라젬 V6',      full_name:'세라젬 마스터 V6 (MB-1901)',                 brand:'기타',     category:'안마의자',   localImg:'img/스마트케어330x6_세라젬_안마의자_CGM MB-1901.jpg' },
  { plan:'330X6', name:'맥북 프로',      full_name:'MacBook Pro M3 (Space Black)',               brand:'기타',     category:'노트북',     localImg:'img/스마트케어330x6_애플_노트북_MX2H3KHA(Space Black).png' },
  { plan:'330X6', name:'LG 워시타워',    full_name:'LG 워시타워 (FX25GNR+RD20GNG)',             brand:'LG',       category:'세탁기',     localImg:'img/스마트케어330x6_lg_세탁기+건조기_FX25GNR+RD20GNG.jpg' },
];

// ── 이미지 → Supabase Storage 업로드 ──────────────────────────────
async function uploadImage(localPath, index) {
  const fullPath = path.join(__dirname, localPath);
  if (!fs.existsSync(fullPath)) {
    return { url: null, err: `파일 없음: ${localPath}` };
  }

  const buffer = fs.readFileSync(fullPath);
  const ext    = path.extname(localPath).toLowerCase().replace('.', '');
  const mimeMap = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png',
                    avif:'image/avif', webp:'image/webp', jfif:'image/jpeg', gif:'image/gif' };
  const contentType = mimeMap[ext] || 'image/jpeg';
  // Supabase는 한글/특수문자 키를 허용하지 않으므로 안전한 이름 사용
  const safeExt  = ext === 'jfif' ? 'jpg' : ext;
  const fileName = `product_${Date.now()}_${index}.${safeExt}`;

  const { error } = await db.storage.from(BUCKET).upload(fileName, buffer, { contentType, upsert: false });
  if (error) return { url: null, err: error.message };

  const { data } = db.storage.from(BUCKET).getPublicUrl(fileName);
  return { url: data.publicUrl, err: null };
}

// ── 메인 동기화 ──────────────────────────────────────────────────
async function sync() {
  console.log('🔄 Supabase 동기화 시작...\n');

  // 기존 Supabase 데이터 불러오기 (중복 방지)
  const { data: existing, error: fetchErr } = await db.from(TABLE).select('full_name, plan');
  if (fetchErr) {
    console.error('❌ Supabase 연결 실패:', fetchErr.message);
    process.exit(1);
  }

  const existingSet = new Set(existing.map(r => `${r.plan}::${r.full_name}`));
  console.log(`  기존 Supabase 레코드: ${existing.length}개\n`);

  let added = 0, skipped = 0, failed = 0;

  for (let i = 0; i < LOCAL_PRODUCTS.length; i++) {
    const p   = LOCAL_PRODUCTS[i];
    const key = `${p.plan}::${p.full_name}`;

    if (existingSet.has(key)) {
      console.log(`  ⏭  [${i+1}/${LOCAL_PRODUCTS.length}] 스킵 (이미 존재): ${p.plan} / ${p.name}`);
      skipped++;
      continue;
    }

    process.stdout.write(`  📤 [${i+1}/${LOCAL_PRODUCTS.length}] ${p.plan} / ${p.name} ... `);

    const { url, err: imgErr } = await uploadImage(p.localImg, i);
    if (!url) {
      process.stdout.write(`❌ 이미지 실패: ${imgErr}\n`);
      failed++;
      continue;
    }

    const { error: insertErr } = await db.from(TABLE).insert({
      plan:      p.plan,
      brand:     p.brand,
      category:  p.category,
      name:      p.name,
      full_name: p.full_name,
      img_url:   url,
    });

    if (insertErr) {
      process.stdout.write(`❌ DB 저장 실패: ${insertErr.message}\n`);
      failed++;
    } else {
      process.stdout.write(`✅\n`);
      added++;
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅ 완료! 추가: ${added}개 | 스킵: ${skipped}개 | 실패: ${failed}개`);
  if (added > 0) console.log(`\n👉 어드민에서 확인: http://localhost:3000/admin.html`);
}

sync().catch(err => { console.error('❌ 치명적 오류:', err); process.exit(1); });
