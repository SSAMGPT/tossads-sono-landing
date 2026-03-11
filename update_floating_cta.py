import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Floating CTA HTML
cta_html = """    <!-- Floating Action Button (CTA) -->
    <div id="floating-cta" class="floating-cta">
        <button class="f-cta-toggle-btn" id="f-cta-toggle-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg>
        </button>
        <div class="f-cta-info">
            <span class="f-cta-plan">스마트케어</span>
            <span class="f-cta-divider">|</span>
            <span class="f-cta-prod">가전 선택됨</span>
            <span class="f-cta-card-badge" style="display:none; font-size:11px; background:#fff; color:#ff1f5d; padding:2px 8px; border-radius:10px; margin-top:4px; font-weight:800; box-shadow:0 2px 5px rgba(0,0,0,0.1);">💳 제휴카드 포함됨</span>
        </div>
        <a href="#consult" class="f-cta-action">
            <span>상담 신청</span>
            <svg class="f-cta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
        </a>
    </div>"""

html = re.sub(
    r'<!-- Floating Action Button \(CTA\) -->.*?</a>',
    cta_html,
    html,
    flags=re.DOTALL
)

# 2. Update JS logic
js_badge_update = """                            // 짧은 이름 형식으로 적용
                            let shortProdName = productName.split('(')[0].trim();
                            if(shortProdName.length > 15) shortProdName = shortProdName.substring(0, 15) + '...';
                            floatingCTA.querySelector('.f-cta-prod').textContent = shortProdName;
                            
                            // 제휴카드 상태 적용
                            const isCardChecked = wrap.querySelector('.sc-calc-check').checked;
                            floatingCTA.querySelector('.f-cta-card-badge').style.display = isCardChecked ? 'inline-block' : 'none';
                            
                            // 만약 최소화 상태면 풀기
                            if(floatingCTA.classList.contains('is-minimized')) {
                                floatingCTA.classList.remove('is-minimized');
                                gsap.to(floatingCTA, { width: '90%', height: 'auto', borderRadius: '50px', duration: 0.6, ease: 'elastic.out(1, 0.75)' });
                            }
"""
html = re.sub(
    r"                            // 짧은 이름 형식으로 적용.*?floatingCTA\.querySelector\('\.f-cta-prod'\)\.textContent = shortProdName;",
    js_badge_update,
    html,
    flags=re.DOTALL
)

checkbox_js = """                            requestAnimationFrame(autoScroll);

                        // 인터랙션 발생 시 일시정지 (사용자가 직접 스크롤/터치 할 때)
"""
checkbox_js_replacement = """                            requestAnimationFrame(autoScroll);
                        
                    // 제휴카드 체크박스 토글 이벤트 추가
                    const calcChecks = document.querySelectorAll('.sc-calc-check');
                    calcChecks.forEach(check => {
                         check.addEventListener('change', () => {
                             const wrap = check.closest('.sc-calc-wrap');
                             const selectedCard = wrap.querySelector('.sc-prod-card.selected');
                             if(selectedCard) {
                                  const floatingCTA = document.getElementById('floating-cta');
                                  floatingCTA.querySelector('.f-cta-card-badge').style.display = check.checked ? 'inline-block' : 'none';
                                  gsap.fromTo(floatingCTA.querySelector('.f-cta-card-badge'), {scale:0}, {scale:1, duration:0.4, ease:'back.out(2)'});
                             }
                         });
                    });

                    // 플로팅 최소화 토글 로직
                    const fCtaToggle = document.getElementById('f-cta-toggle-btn');
                    const floatingCTA = document.getElementById('floating-cta');
                    if(fCtaToggle && floatingCTA) {
                        fCtaToggle.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if(floatingCTA.classList.contains('is-minimized')) {
                                floatingCTA.classList.remove('is-minimized');
                                gsap.to(floatingCTA, { width: '90%', borderRadius: '50px', duration: 0.6, ease: 'elastic.out(1, 0.75)' });
                                gsap.to(floatingCTA.querySelector('.f-cta-toggle-btn svg'), { rotation: 0, duration: 0.3 });
                            } else {
                                floatingCTA.classList.add('is-minimized');
                                gsap.to(floatingCTA, { width: '60px', borderRadius: '30px', duration: 0.6, ease: 'elastic.out(1, 0.75)' });
                                gsap.to(floatingCTA.querySelector('.f-cta-toggle-btn svg'), { rotation: 180, duration: 0.3 });
                            }
                        });
                        
                        // 최소화 상태일 때 클릭하면 다시 커짐
                        floatingCTA.addEventListener('click', (e) => {
                            if(floatingCTA.classList.contains('is-minimized') && e.target !== fCtaToggle && !fCtaToggle.contains(e.target)) {
                                floatingCTA.classList.remove('is-minimized');
                                gsap.to(floatingCTA, { width: '90%', borderRadius: '50px', duration: 0.6, ease: 'elastic.out(1, 0.75)' });
                                gsap.to(floatingCTA.querySelector('.f-cta-toggle-btn svg'), { rotation: 0, duration: 0.3 });
                            }
                        });
                    }

                        // 인터랙션 발생 시 일시정지 (사용자가 직접 스크롤/터치 할 때)
"""
html = html.replace(checkbox_js, checkbox_js_replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css_replacement = """/* Floating Action Button (CTA) */
.floating-cta {
    position: fixed;
    bottom: -100px;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 90%;
    max-width: 400px;
    height: 64px;
    background: #ff1f5d;
    color: #fff;
    z-index: 9999;
    padding: 0 1.5rem;
    border-radius: 50px;
    box-shadow: 0 10px 30px rgba(255, 31, 93, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-decoration: none;
    transition: bottom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
}

.f-cta-toggle-btn {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.2);
    border: none;
    color: white;
    width: 40px;
    height: 18px;
    border-radius: 0 0 10px 10px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 2px;
    z-index: 2;
}

.floating-cta.is-minimized {
    padding: 0;
    justify-content: center;
    cursor: pointer;
}

.floating-cta.is-minimized .f-cta-info,
.floating-cta.is-minimized .f-cta-action span {
    display: none;
}

.floating-cta.is-minimized .f-cta-toggle-btn {
    top: auto;
    bottom: -4px;
    border-radius: 10px 10px 0 0;
    padding-bottom: 0;
    padding-top: 2px;
    height: 15px;
}

.floating-cta.active {
    bottom: 2rem;
    opacity: 1;
    pointer-events: auto;
}

.f-cta-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    z-index: 1;
}
"""

css = re.sub(
    r'/\* Floating Action Button \(CTA\) \*/.*?\.f-cta-info \{.*?\}',
    css_replacement,
    css,
    flags=re.DOTALL
)

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

