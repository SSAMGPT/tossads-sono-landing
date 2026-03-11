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

    // 사용자가 처음으로 무언가를 클릭(선택)했는지 여부
    let hasSelected = false;

    // Update Floating Bar
    function updateFloatingBar() {
        if(globalFloatingBar && hasSelected) {
            gfbPlan.textContent = currentPlanName;
            gfbBrand.textContent = currentBrandName;
            gfbCat.textContent = currentCatName;
            gfbPriceVal.textContent = currentPrice + '원';
            globalFloatingBar.classList.add('is-visible');
        }
    }

    // 초기 상태에서 .is-visible 클래스가 있을 수 있으므로 제거 (보이지 않게 처리)
    if(globalFloatingBar) {
        globalFloatingBar.classList.remove('is-visible');
    }

    // 1. 대분류 선택 (배너 및 플로팅 데이터 변경)
    mainTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            mainTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const month = e.currentTarget.dataset.month;
            const total = e.currentTarget.dataset.total;
            const type = e.currentTarget.dataset.main;
            currentPlanName = e.currentTarget.textContent;
            currentPrice = month;

            bannerMonth.textContent = month;
            bannerTotal.textContent = total;
            bannerTimes.textContent = `X ${type}회`;
            
            const targetPriceBox = bannerMonth.closest('.sc-banner__price');
            gsap.fromTo(targetPriceBox, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
            
            hasSelected = true; // 무언가 선택했음을 표시
            updateFloatingBar();
            filterProducts();
        });
    });

    // 2. 브랜드, 카테고리 필터링
    function filterProducts() {
        productCards.forEach(card => {
            const cardBrand = card.dataset.brand;
            const cardCat = card.dataset.cat;

            const brandMatch = currentBrand === 'all' || cardBrand === currentBrand;
            const catMatch = currentCat === 'all' || cardCat === currentCat;

            if (brandMatch && catMatch) {
                card.style.display = 'flex';
                gsap.fromTo(card, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, clearProps: "all" });
            } else {
                card.style.display = 'none';
            }
        });
        
        const scList = document.getElementById('sc-product-list');
        if(scList) {
             gsap.to(scList, {scrollTo: {x: 0}, duration: 0.3});
        }
    }

    brandTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            brandTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentBrand = e.currentTarget.dataset.brand;
            currentBrandName = e.currentTarget.textContent;
            hasSelected = true; // 무언가 선택했음을 표시
            updateFloatingBar();
            filterProducts();
        });
    });

    catTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            catTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentCat = e.currentTarget.dataset.cat;
            currentCatName = e.currentTarget.textContent;
            hasSelected = true; // 무언가 선택했음을 표시
            updateFloatingBar();
            filterProducts();
        });
    });

    // 제품 카드 클릭 시에도 플로팅 바 띄우기 (선택 옵션)
    productCards.forEach(card => {
        card.addEventListener('click', () => {
             hasSelected = true;
             updateFloatingBar();
        });
    });

    // 3. GSAP Lighting & Entrance Effect for Smartcare Section
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const scSection = document.querySelector('.smartcare-section');
        const scLightBeam = document.querySelector('.sc-light-beam');
        const scContainer = document.querySelector('.sc-container');

        if(scSection && scLightBeam && scContainer) {
            // Init styles
            gsap.set(scContainer, { opacity: 0, y: 50 });

            ScrollTrigger.create({
                trigger: scSection,
                start: "top 70%", // 섹션이 화면 70% 지점에 도달할 때
                onEnter: () => {
                    // Turn background to white smoothly
                    // GSAP bg handled by global lightTl in index.html
                    
                    // Spotlight animation
                    gsap.fromTo(scLightBeam, 
                        { opacity: 0, y: -200, scale: 0.5 },
                        { opacity: 1, y: 0, scale: 1.5, duration: 1.5, ease: "power2.out" }
                    );
                    gsap.to(scLightBeam, { opacity: 0, duration: 1, delay: 1.5 }); // fade out spotlight

                    // Fade in content
                    gsap.to(scContainer, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" });

                    // 예전에는 여기서 updateFloatingBar()를 무조건 불렀으나, 
                    // 이제는 사용자가 선택을 해야만 뜨게 하므로 주석 처리/삭제합니다.
                    // updateFloatingBar();
                },
                once: true // 한 번만 실행되게 (프리미엄 느낌)
            });
        }
    }

});
