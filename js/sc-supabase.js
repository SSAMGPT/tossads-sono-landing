/**
 * sc-supabase.js
 * 랜딩 페이지에서 Supabase의 products 테이블을 읽어
 * 스마트케어 제품 카드를 동적으로 렌더링합니다.
 */

(function () {
  const SUPABASE_URL = 'https://rbliwhiibewihqlpmihd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_n0rEJFTn6Qu12Ui_qDO8bw_sSVJbTR-';
  const TABLE = 'products';

  // 플랜 ID ↔ 탭 pane ID 매핑
  const PANE_MAP = {
    '330X2': 'sc-pane-330x2',
    '330X3': 'sc-pane-330x3',
    '330X4': 'sc-pane-330x4',
    '330X6': 'sc-pane-330x6',
  };

  // 카드 HTML 생성
  function makeCard(p) {
    const div = document.createElement('div');
    div.className = 'sc-prod-card';
    div.dataset.name     = p.full_name || p.name || '';
    div.dataset.brand    = p.brand    || '';
    div.dataset.category = p.category || '';
    div.innerHTML = `
      <div class="sc-prod-img">
        <img src="${p.img_url}" alt="${p.full_name || p.name}"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%2260%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2240%22>📦</text></svg>'">
      </div>
      <p class="sc-prod-name">${p.name}</p>
    `;
    return div;
  }

  // 각 pane의 sc-prod-swiper를 Supabase 데이터로 교체
  function renderProducts(allProducts) {
    Object.entries(PANE_MAP).forEach(([planKey, paneId]) => {
      const pane   = document.getElementById(paneId);
      if (!pane) return;
      const swiper = pane.querySelector('.sc-prod-swiper');
      if (!swiper) return;

      const planProducts = allProducts.filter(p => p.plan === planKey);
      if (!planProducts.length) return; // Supabase에 데이터 없으면 기존 HTML 유지

      // 기존 하드코딩 카드 제거 후 재렌더
      swiper.innerHTML = '';
      planProducts.forEach(p => swiper.appendChild(makeCard(p)));
    });
  }

  // Supabase 초기화 및 데이터 로드
  async function loadFromSupabase() {
    if (typeof supabase === 'undefined') {
      console.warn('[sc-supabase] Supabase SDK 없음 — 하드코딩 데이터 사용');
      return;
    }

    const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await db.from(TABLE).select('*')
      .order('plan').order('sort_order', { nullsFirst: false }).order('created_at');

    if (error) {
      console.warn('[sc-supabase] 로드 실패, 하드코딩 데이터 사용:', error.message);
      return;
    }

    if (!data || !data.length) {
      console.info('[sc-supabase] Supabase에 데이터 없음, 하드코딩 유지');
      return;
    }

    renderProducts(data);

    // 필터 재초기화 (smartcare.js의 함수 호출)
    if (typeof window.initSmartcareFilters === 'function') {
      window.initSmartcareFilters();
    }

    console.info(`[sc-supabase] ✅ ${data.length}개 제품 로드 완료`);
  }

  // DOM 준비 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFromSupabase);
  } else {
    loadFromSupabase();
  }
})();
