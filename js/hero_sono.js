// ─── 인트로 매번 재생 로직 ────────────────────────────────────────────
// 새 탭/링크 진입 → 항상 인트로, reload + 스크롤된 위치 → 스킵
const _isReload = (() => {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    return nav ? nav.type === 'reload' : performance.navigation.type === 1;
  } catch (e) { return false; }
})();

if (!_isReload) {
  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
} else {
  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
}

// Removes whitespace text nodes between split-word spans so CSS margin-right
// provides consistent spacing regardless of browser/SplitText text node insertion behaviour
function removeWordTextNodes(el) {
  Array.from(el.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && /^\s+$/.test(node.nodeValue)) {
      node.remove();
    }
  });
}

// Register GSAP plugins
if (typeof SplitText !== 'undefined' && typeof CustomEase !== 'undefined') {
  gsap.registerPlugin(SplitText, CustomEase);
  CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");
}

/* 슬라이드별 텍스트 (hero_webgl.js IMAGES 배열 순서와 동일) */
var HERO_TEXTS = [
  ['소노아임레디', '스마트케어'],                // 0: sono-hero-01
  ['쓴 만큼 고스란히', '만기 환급형 가전 렌탈'],    // 1: sono-hero-02
  ['월 납입 부담은 나누고', '만기 혜택은 분명하게'], // 2: sono-hero-03
  ['당신의 일상을', '더 특별하게.'],           // 3: sono-hero-04
  ['소노의 모든 공간', '특별한 멤버십 혜택'],       // 4: sono-hero-05
];

/* h1에 새 텍스트를 주입하고 SplitText 적용 후 글로벌 저장 */
function heroSplitApply(textPair) {
  var h1 = document.querySelector('.crisp-header__h1');
  if (!h1) return null;

  /* 이전 SplitText 명시적 정리
     (GSAP이 동일 요소 재분리 시 old 텍스트로 auto-revert하는 것 방지) */
  if (window._heroSplit && typeof window._heroSplit.revert === 'function') {
    window._heroSplit.revert();
  }

  /* DOM 교체 (원래 구조: br 사용) */
  h1.innerHTML = textPair[0] + '<br>' + textPair[1];

  if (typeof SplitText === 'undefined') return null;

  var s = new SplitText([h1], {
    type: 'words,chars',
    wordsClass: 'split-word',
    charsClass: 'split-char'
  });
  removeWordTextNodes(h1);
  window._heroSplit = s;
  return s;
}

/* 현재 쾐주얼 페이드 아웃 */
window._heroTextFadeOut = function() {
  var s = window._heroSplit;
  if (s && s.chars && s.chars.length) {
    gsap.to(s.chars, {
      opacity: 0,
      duration: 0.35,
      stagger: { from: 'center', each: 0.02 }
    });
  }
  /* Subtitle 페이드 아웃 로직 */
  var sub = document.getElementById('hero-subtitle');
  if (sub) {
    var subChars = sub.querySelectorAll('.split-char');
    if (subChars.length) {
      gsap.to(subChars, { opacity: 0, duration: 0.3, stagger: { from: 'center', each: 0.01 } });
    } else {
      gsap.to(sub, { opacity: 0, duration: 0.3 });
    }
  }
};

/* 이미지 전환 완료 후 새 텍스트 등장 (초기와 동일한 SplitText 애니메이션) */
window._heroSlideTextChange = function(slideIndex) {
  var textPair = HERO_TEXTS[slideIndex] || HERO_TEXTS[0];
  var s = heroSplitApply(textPair);
  if (!s || !s.chars || !s.chars.length) return;
  gsap.set(s.chars, { opacity: 0 });
  /* chars: 중앙에서 페이드 인 */
  gsap.fromTo(s.chars,
    { opacity: 0 },
    { duration: 1.2, opacity: 1, ease: 'power1.inOut',
      stagger: { from: 'center', each: 0.04 } }
  );
  /* words: 스프링 업 (초기 등장과 동일) */
  if (s.words && s.words.length) {
    gsap.from(s.words,
      { duration: 3, y: function(i) { return (i * 100) - 50; }, ease: 'expo.out' }
    );
  }

  /* 세 번째 슬라이드 전용 안내 문구 (Subtitle) 처리 */
  var sub = document.getElementById('hero-subtitle');
  if (sub) {
    if (slideIndex === 2) {
      sub.textContent = "스마트케어 330 결합 플랜 안내";
      sub.classList.add('is--active');
      gsap.set(sub, { opacity: 1 });
      
      if (typeof SplitText !== 'undefined') {
        var subSplit = new SplitText(sub, { type: 'chars', charsClass: 'split-char' });
        gsap.set(subSplit.chars, { opacity: 0 });
        gsap.fromTo(subSplit.chars, 
          { opacity: 0 }, 
          { duration: 1.2, opacity: 1, stagger: { from: 'center', each: 0.04 }, ease: 'power1.inOut', delay: 0.2 }
        );
      }
    } else {
      sub.classList.remove('is--active');
      gsap.to(sub, { opacity: 0, duration: 0.4, onComplete: function() { sub.innerHTML = ""; } });
    }
  }
};

// Loading Animation
function initCrispLoadingAnimation() {
  const container = document.querySelector(".crisp-header");
  if (!container) return;

  const headings   = container.querySelectorAll(".crisp-header__h1");
  const sliderNav  = container.querySelectorAll(".crisp-header__slider-nav > *");
  const smallElements = document.querySelectorAll(".crisp-header__p, .crisp-header__top");
  const mainHeader    = document.querySelector(".main-header");

  if (mainHeader) gsap.set(mainHeader, { opacity: 0, y: -20, pointerEvents: "none" });

  /* GSAP SplitText — words + chars */
  let split;
  if (headings.length && typeof SplitText !== 'undefined') {
    headings.forEach(h => { h.innerHTML = h.innerHTML; });
    split = new SplitText(headings, {
      type: "words,chars",
      wordsClass: "split-word",
      charsClass: "split-char"
    });
    /* h1 + hero-h1-line 모든 공백 텍스트 노드 제거
       (flex 레이아웃에서 공백 텍스트 노드 → anonymous flex item 방지,
        gap으로 단어 간격 제공) */
    headings.forEach(removeWordTextNodes);
    headings.forEach(h => {
      h.querySelectorAll('.hero-h1-line').forEach(removeWordTextNodes);
    });
  }

  /* GSAP Timeline — only splash part */
  const tl = gsap.timeline({
    defaults: { ease: "expo.inOut" },
    onStart: () => container.classList.remove('is--hidden')
  });

  /* 0. Splash Animation (Logo) */
  const splash     = container.querySelector(".crisp-splash");
  const splashLogo = container.querySelector(".crisp-splash__logo");

  if (splash && splashLogo) {
    tl.to(splashLogo, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" })
      .to(splashLogo, { opacity: 0, scale: 1.1, duration: 0.6, ease: "power2.in" }, "+=0.2")
      .to(splash, { autoAlpha: 0, duration: 0.5 }, "-=0.1");
  }

  /* After splash → trigger WebGL intro, then animate text + nav in callback */
  tl.call(function () {
    const scrollBtn = document.querySelector('.hero-scrolldown');

    function revealTextAndNav() {
      /* Remove loading overlay */
      container.classList.remove('is--loading');

      /* Nav header slides down */
      if (mainHeader) {
        gsap.fromTo(mainHeader,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, pointerEvents: "auto", ease: "power2.out", duration: 1 }
        );
      }

      /* Thumbnail nav slides up */
      if (sliderNav.length) {
        gsap.from(sliderNav, { yPercent: 150, stagger: 0.05, ease: "expo.out", duration: 1 });
      }

      /* Scroll button */
      if (scrollBtn) {
        gsap.fromTo(scrollBtn,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.8 }
        );
      }

      /* Hero heading — chars 중앙에서 fade in + words spring */
      if (split && split.chars && split.chars.length) {
        /* 전역 저장 → 슬라이드 전환 시 _heroTextFadeOut에서 사용 */
        window._heroSplit = split;
        gsap.set(headings, { opacity: 1 });
        gsap.set(split.chars, { opacity: 0 });
        gsap.fromTo(split.chars,
          { opacity: 0 },
          { duration: 1.2, opacity: 1, ease: "power1.inOut",
            stagger: { from: "center", each: 0.04 } }
        );
        gsap.from(split.words,
          { duration: 3, y: (i) => (i * 100) - 50, ease: "expo.out" }
        );
      } else if (headings.length) {
        gsap.to(headings, { opacity: 1, duration: 0.8 });
      }

      if (smallElements.length) {
        gsap.to(smallElements, { opacity: 1, y: 0, pointerEvents: "auto", ease: "power1.inOut", duration: 0.8 });
      }

      /* Start WebGL autoplay after intro completes */
      if (window._heroWebGLInstance) {
        window._heroWebGLInstance.startAutoplay();
      }
    }

    /* Wait for WebGL textures to load (usually done by now), then run intro wipe */
    function runWebGLIntro() {
      if (window._heroWebGLInstance) {
        window._heroWebGLInstance.introTransition(revealTextAndNav);
      } else {
        /* Fallback: no WebGL — reveal immediately */
        revealTextAndNav();
      }
    }

    if (window._heroWebGLIsReady) {
      runWebGLIntro();
    } else {
      /* Textures still loading — queue callback */
      window._heroWebGLReadyCallback = runWebGLIntro;
    }
  }, null, ">");   // fires right after splash ends

  if (smallElements.length) {
    gsap.set(smallElements, { opacity: 0, y: 10, pointerEvents: "none" });
  }
}


// Initialize Crisp Loading Animation
function _skipIntro() {
  const container = document.querySelector('.crisp-header');
  if (container) {
    container.classList.remove('is--loading');
    container.classList.remove('is--hidden'); // ← 핵심: 이게 없으면 화면이 보이지 않음
  }
  const mainHeader = document.querySelector('.main-header');
  if (mainHeader) gsap.set(mainHeader, { opacity: 1, y: 0, pointerEvents: 'auto' });
  const headings = container ? container.querySelectorAll('.crisp-header__h1') : [];
  headings.forEach(h => gsap.set(h, { opacity: 1 }));
  const smallElements = document.querySelectorAll('.crisp-header__p, .crisp-header__top');
  gsap.set(smallElements, { opacity: 1, y: 0, pointerEvents: 'auto' });
  const sliderNav = container ? container.querySelectorAll('.crisp-header__slider-nav > *') : [];
  gsap.set(sliderNav, { yPercent: 0 });
  const scrollBtn = document.querySelector('.hero-scrolldown');
  if (scrollBtn) gsap.set(scrollBtn, { opacity: 1, y: 0 });
  const splash = container ? container.querySelector('.crisp-splash') : null;
  if (splash) gsap.set(splash, { autoAlpha: 0 });

  // ── WebGL: 인트로 스킵 시 첫 이미지를 즉시 표시 (회색 캔버스 방지) ──
  function _webglShowFirstAndAutoplay() {
    var w = window._heroWebGLInstance;
    if (!w || !w.textures || !w.textures[0]) return;
    // 애니메이션 없이 첫 번째 이미지를 바로 표시
    w.material.uniforms.texture1.value = w.textures[0];
    w.material.uniforms.texture2.value = w.textures[0];
    w.material.uniforms.progress.value = 0;
    w._resize();
    w.startAutoplay();
  }
  if (window._heroWebGLIsReady) {
    _webglShowFirstAndAutoplay();
  } else {
    // 텍스처 로딩 중이면 준비 완료 시 실행
    window._heroWebGLReadyCallback = _webglShowFirstAndAutoplay;
  }
}


document.fonts.ready.then(() => {
  const run = () => {
    // reload + 이미 스크롤된 위치 → 인트로 스킵
    if (_isReload && window.scrollY > window.innerHeight * 0.25) {
      _skipIntro();
    } else {
      initCrispLoadingAnimation();
    }
  };
  // reload시 브라우저 스크롤 복원 기다린 후 판단 (50→150ms)
  _isReload ? setTimeout(run, 150) : run();

  // ── 모바일 카드 플립: 클릭으로 토글 ──
  document.querySelectorAll('.refund-card').forEach(card => {
    card.addEventListener('click', function () {
      this.classList.toggle('is--flipped');
    });
  });
});

// ── Safari/모바일 안전망: fonts.ready가 발화하지 않거나 GSAP 실패 시 ──
// 인트로 전체 길이 ~7.1초 → 12초 후에도 is--loading 상태면 강제 해제
const _safariFallbackTimer = setTimeout(function () {
  const container = document.querySelector('.crisp-header');
  if (container && container.classList.contains('is--loading')) {
    console.warn('[hero] Safari fallback: releasing loading state after timeout');
    container.classList.remove('is--loading');
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) gsap.set(mainHeader, { opacity: 1, y: 0, pointerEvents: 'auto' });
    const headings = container.querySelectorAll('.crisp-header__h1');
    headings.forEach(h => gsap.set(h, { opacity: 1 }));
    const sliderNav = container.querySelectorAll('.crisp-header__slider-nav > *');
    if (sliderNav.length) gsap.set(sliderNav, { yPercent: 0 });
    const scrollBtn = document.querySelector('.hero-scrolldown');
    if (scrollBtn) gsap.set(scrollBtn, { opacity: 1, y: 0 });
    const smallElements = document.querySelectorAll('.crisp-header__p, .crisp-header__top');
    gsap.set(smallElements, { opacity: 1, y: 0, pointerEvents: 'auto' });
  }
}, 12000); // 6000→12000: 인트로 7.1초 완료 후에만 발동하도록

// Slideshow
function initSlideShow(el) {
  const ui = {
    el,
    slides: Array.from(el.querySelectorAll('[data-slideshow="slide"]')),
    inner: Array.from(el.querySelectorAll('[data-slideshow="parallax"]')),
    thumbs: Array.from(el.querySelectorAll('[data-slideshow="thumb"]'))
  };

  const heading = el.querySelector('.crisp-header__h1');

  // Determine current index from HTML or default to 0
  let current = ui.slides.findIndex(slide => slide.classList.contains('is--current'));
  if (current === -1) current = 0;

  const length = ui.slides.length;
  let animating = false;
  const animationDuration = 1.5;

  ui.slides.forEach((slide, index) => slide.setAttribute('data-index', index));
  ui.thumbs.forEach((thumb, index) => thumb.setAttribute('data-index', index));

  // Add classes if not already present
  if (ui.slides[current]) ui.slides[current].classList.add('is--current');
  if (ui.thumbs[current]) ui.thumbs[current].classList.add('is--current');

  // Text change animation using SplitText
  let currentSplit = null;
  
  function animateHeadingChange(newHTML) {
    if (!heading || !newHTML) return;
    if (typeof SplitText === 'undefined') {
      heading.innerHTML = newHTML;
      return;
    }

    // Target EXISTING split-char elements already in the DOM.
    // Creating a new SplitText for the exit would remove word wrappers
    // (SplitText 3.14.2 unwraps words when type='chars' only),
    // causing margin-right to vanish and the text to visibly shift left.
    const existingChars = Array.from(heading.querySelectorAll('.split-char'));

    const doTransitionIn = () => {
      // Hide the heading while we restructure the DOM
      gsap.set(heading, { opacity: 0 });
      // Revert previous navigation's split (null on first click — that's fine)
      if (currentSplit) { currentSplit.revert(); currentSplit = null; }
      // Set new text
      heading.innerHTML = newHTML;
      // Split new text
      // overwrite: false prevents SplitText 3.14.2 from auto-reverting the heading
      // to the PREVIOUS split's original HTML (which would show the init text again)
      currentSplit = new SplitText(heading, {
        type: 'words,chars',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        overwrite: false
      });
      removeWordTextNodes(heading);
      gsap.set(currentSplit.chars, { opacity: 0 });
      gsap.set(heading, { opacity: 1 }); // container visible, chars hidden
      gsap.fromTo(currentSplit.chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: 'power1.inOut',
          stagger: { from: 'center', each: 0.04 }
        }
      );
      gsap.from(currentSplit.words, {
        y: (i) => (i * 60) - 30,
        duration: 1.5,
        ease: 'expo.out'
      });
    };

    if (existingChars.length) {
      // Animate out existing chars without touching word wrapper structure
      gsap.to(existingChars, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        stagger: { from: 'center', each: 0.02 },
        ease: 'power1.in',
        onComplete: doTransitionIn
      });
    } else {
      doTransitionIn();
    }
  }

  function navigate(direction, targetIndex = null) {
    if (animating) return;
    animating = true;

    const previous = current;
    current =
      targetIndex !== null && targetIndex !== undefined
        ? targetIndex
        : direction === 1
          ? (current < length - 1 ? current + 1 : 0)
          : (current > 0 ? current - 1 : length - 1);

    const currentSlide = ui.slides[previous];
    const currentInner = ui.inner[previous];
    const upcomingSlide = ui.slides[current];
    const upcomingInner = ui.inner[current];

    // Update heading text if data-text is set
    const newText = ui.thumbs[current]?.getAttribute('data-text');
    if (newText) animateHeadingChange(newText);

    gsap.timeline({
      defaults: { duration: animationDuration, ease: 'slideshow-wipe' },
      onStart() {
        upcomingSlide.classList.add('is--current');
        ui.thumbs[previous].classList.remove('is--current');
        ui.thumbs[current].classList.add('is--current');
      },
      onComplete() {
        currentSlide.classList.remove('is--current');
        animating = false;
      }
    })
      .to(currentSlide, { xPercent: -direction * 100 }, 0)
      .to(currentInner, { xPercent: direction * 75 }, 0)
      .fromTo(upcomingSlide, { xPercent: direction * 100 }, { xPercent: 0 }, 0)
      .fromTo(upcomingInner, { xPercent: -direction * 75 }, { xPercent: 0 }, 0);
  }

  ui.thumbs.forEach(thumb => {
    thumb.addEventListener('click', event => {
      const targetIndex = parseInt(event.currentTarget.getAttribute('data-index'), 10);
      if (targetIndex === current || animating) return;
      const direction = targetIndex > current ? 1 : -1;
      navigate(direction, targetIndex);
    });
  });
}

// Initialize Slideshow
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-slideshow="wrap"]').forEach(wrap => initSlideShow(wrap));
});
