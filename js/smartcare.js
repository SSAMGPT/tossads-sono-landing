/* 스마트케어 인터랙션 스크립트 */
document.addEventListener('DOMContentLoaded', () => {

    const mainTabs = document.querySelectorAll('.sc-tab.main-tab');
    const brandTabs = document.querySelectorAll('.sc-tab.brand-tab');
    const catTabs = document.querySelectorAll('.sc-tab.cat-tab');
    
    // Banner elements
    const bannerMonth = document.getElementById('banner-monthly');
    const bannerTotal = document.getElementById('banner-total');
    const bannerTimes = document.getElementById('banner-times');

    // Global floating bar elements
    const gfbPlan = document.getElementById('gfb-plan');
    const gfbBrand = document.getElementById('gfb-brand');
    const gfbCat = document.getElementById('gfb-cat');
    const gfbPriceVal = document.getElementById('gfb-price-val');
    const globalFloatingBar = document.getElementById('global-floating-bar');

    const productCards = document.querySelectorAll('.sc-product-card');

    let currentBrand = 'all';
    let currentBrandName = '전체보기 (브랜드)';
    let currentCat = 'all';
    let currentCatName = '전체보기 (가전)';
    let currentPlanName = '스마트케어 150';
    let currentPrice = '19,900';
    let hasSelected = false;

    function updateFloatingBar() {
        if (globalFloatingBar && hasSelected) {
            gfbPlan.textContent = currentPlanName;
            gfbBrand.textContent = currentBrandName;
            gfbCat.textContent = currentCatName;
            gfbPriceVal.textContent = currentPrice + '원';
            globalFloatingBar.classList.add('is-visible');
        }
    }

    if (globalFloatingBar) globalFloatingBar.classList.remove('is-visible');

    // 1. 대분류 선택
    mainTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            mainTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const month = e.currentTarget.dataset.month;
            const total = e.currentTarget.dataset.total;
            const type  = e.currentTarget.dataset.main;
            currentPlanName = e.currentTarget.textContent;
            currentPrice = month;
            bannerMonth.textContent = month;
            bannerTotal.textContent = total;
            bannerTimes.textContent = `X ${type}회`;
            const box = bannerMonth.closest('.sc-banner__price');
            gsap.fromTo(box, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
            hasSelected = true;
            updateFloatingBar();
            filterProducts();
        });
    });

    // 2. 레거시 필터
    function filterProducts() {
        productCards.forEach(card => {
            const brandMatch = currentBrand === 'all' || card.dataset.brand === currentBrand;
            const catMatch   = currentCat   === 'all' || card.dataset.cat   === currentCat;
            if (brandMatch && catMatch) {
                card.style.display = 'flex';
                gsap.fromTo(card, { opacity:0, scale:0.9 }, { opacity:1, scale:1, duration:0.3, clearProps:'all' });
            } else {
                card.style.display = 'none';
            }
        });
    }

    brandTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            brandTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentBrand     = e.currentTarget.dataset.brand;
            currentBrandName = e.currentTarget.textContent;
            hasSelected = true;
            updateFloatingBar();
            filterProducts();
        });
    });

    catTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            catTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentCat     = e.currentTarget.dataset.cat;
            currentCatName = e.currentTarget.textContent;
            hasSelected = true;
            updateFloatingBar();
            filterProducts();
        });
    });

    productCards.forEach(card => {
        card.addEventListener('click', () => { hasSelected = true; updateFloatingBar(); });
    });

    // 3. Scroll 입장 효과
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        const scSection   = document.querySelector('.smartcare-section');
        const scContainer = document.querySelector('.sc-container');
        if (scSection && scContainer) {
            ScrollTrigger.create({
                trigger: scSection, start: 'top 80%',
                onEnter: () => gsap.fromTo(scContainer, { opacity:0, y:30 }, { opacity:1, y:0, duration:0.8, ease:'power2.out' }),
                once: true
            });
        }
    }

    // ── 4. 브랜드 + 카테고리 필터 (재호출 가능) ──────────────────────
    window.initSmartcareFilters = function () {
        // 재초기화 시 중복 empty-msg 방지
        document.querySelectorAll('.sc-empty-msg').forEach(el => el.remove());

        document.querySelectorAll('.sc-calc-wrap').forEach(calcWrap => {
            const brandBtns = calcWrap.querySelectorAll('.sc-brand-filter .sc-bf-btn');
            const catBtns   = calcWrap.querySelectorAll('.sc-cat-filter .sc-ct-btn');
            const swiper    = calcWrap.querySelector('.sc-prod-swiper');
            if (!swiper) return;

            // 빈 결과 안내 메시지 생성
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'sc-empty-msg';
            emptyMsg.textContent = '해당 조건의 제품이 없습니다.';
            swiper.after(emptyMsg);

            let activeBrand = '전체';
            let activeCat   = '전체';

            function applyFilters() {
                let visibleCount = 0;
                calcWrap.querySelectorAll('.sc-prod-card').forEach(card => {
                    const bMatch = activeBrand === '전체' || card.dataset.brand    === activeBrand;
                    const cMatch = activeCat   === '전체' || card.dataset.category === activeCat;
                    const show   = bMatch && cMatch;
                    card.classList.toggle('bf-hidden', !show);
                    if (show) visibleCount++;
                });
                swiper.style.display = visibleCount === 0 ? 'none' : '';
                emptyMsg.classList.toggle('visible', visibleCount === 0);
            }

            brandBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    brandBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeBrand = btn.dataset.brand;
                    applyFilters();
                });
            });

            catBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    catBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeCat = btn.dataset.cat;
                    applyFilters();
                });
            });
        });
    };

    // 최초 실행
    window.initSmartcareFilters();
});
