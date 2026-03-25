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

  // 각 pane의 필터 버튼과 sc-prod-swiper를 Supabase 데이터로 교체
  function renderProducts(allProducts, optionsData) {
    // 1. `options` 테이블 데이터 기반으로 브랜드 및 카테고리 추출
    const optBrands = (optionsData || []).filter(o => o.type === 'brand' && o.value !== '전체').sort((a,b) => a.sort_order - b.sort_order).map(o => o.value);
    const globalBrands = optBrands.length > 0 ? optBrands : [...new Set(allProducts.map(p => p.brand).filter(Boolean))];

    const optCats = (optionsData || []).filter(o => o.type === 'category' && o.value !== '전체').sort((a,b) => a.sort_order - b.sort_order).map(o => o.value);
    const globalCats = optCats.length > 0 ? optCats : [...new Set(allProducts.map(p => p.category).filter(Boolean))];

    Object.entries(PANE_MAP).forEach(([planKey, paneId]) => {
      const pane   = document.getElementById(paneId);
      if (!pane) return;

      // 2. 동적 필터 UI 재생성
      const bfWrap = pane.querySelector('.sc-brand-filter');
      if (bfWrap) {
        bfWrap.innerHTML = '<button class="sc-bf-btn active" data-brand="전체">전체</button>';
        globalBrands.forEach(b => {
          const btn = document.createElement('button');
          btn.className = 'sc-bf-btn';
          btn.dataset.brand = b;
          btn.textContent = b;
          bfWrap.appendChild(btn);
        });
      }

      const ctWrap = pane.querySelector('.sc-cat-filter');
      if (ctWrap) {
        ctWrap.innerHTML = '<button class="sc-ct-btn active" data-cat="전체">전체</button>';
        globalCats.forEach(c => {
          const btn = document.createElement('button');
          btn.className = 'sc-ct-btn';
          btn.dataset.cat = c;
          btn.textContent = c;
          ctWrap.appendChild(btn);
        });
      }

      // 3. 카드 렌더링
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
    
    // 상품과 옵션 데이터 병렬 조회
    const [productsRes, optionsRes] = await Promise.all([
        db.from(TABLE).select('*').order('plan').order('sort_order', { nullsFirst: false }).order('created_at'),
        db.from('options').select('*')
    ]);

    if (productsRes.error) {
      console.warn('[sc-supabase] 상품 로드 실패, 하드코딩 데이터 사용:', productsRes.error.message);
      return;
    }
    
    const data = productsRes.data;

    if (!data || !data.length) {
      console.info('[sc-supabase] Supabase에 데이터 없음, 하드코딩 유지');
      return;
    }

    // 4. 모달창 속 하드코딩된 리스트(CM_APPLIANCES)를 DB 데이터로 실시간 덮어쓰기 동기화
    if (window.CM_APPLIANCES) {
      // 플랜별 배열 리셋
      Object.keys(window.CM_APPLIANCES).forEach(k => { window.CM_APPLIANCES[k] = []; });
      
      data.forEach(p => {
        if (!window.CM_APPLIANCES[p.plan]) {
            window.CM_APPLIANCES[p.plan] = [];
        }
        window.CM_APPLIANCES[p.plan].push({
          name: p.name || p.full_name,
          fullName: p.full_name || p.name,
          img: p.img_url || '',
          brand: p.brand || ''
        });
      });
      console.info('[sc-supabase] ✅ 모달창 CM_APPLIANCES 동기화 완료');
    }

    renderProducts(data, optionsRes.data || []);

    // 필터 재초기화 (smartcare.js의 함수 호출)
    if (typeof window.initSmartcareFilters === 'function') {
      window.initSmartcareFilters();
    }

    // 동적 생성 시 삭제되었던 슬라이딩 블루 배경(.sc-selection)을 복구하기 위해 리사이즈 이벤트 강제 발생
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);

    console.info(`[sc-supabase] ✅ ${data.length}개 제품 로드 완료`);
  }

  // DOM 준비 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFromSupabase);
  } else {
    loadFromSupabase();
  }
})();
