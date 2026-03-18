// ─── 인트로 재생 조건 결정 ─────────────────────────────────────────────────
// 규칙:
//  1. 새 탭/링크 진입 (fresh) → 항상 인트로 재생, 최상단 강제 이동
//  2. 새로고침(reload) + 스크롤 최상단 → 인트로 재생
//  3. 새로고침(reload) + 다른 섹션 → 인트로 스킵 (해당 위치 그대로)

const _isReload = (() => {
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    return nav ? nav.type === 'reload' : performance.navigation.type === 1;
  } catch (e) { return false; }
})();

if (!_isReload) {
  // 새 진입: 최상단으로 이동 후 인트로 재생
  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
} else {
  // 새로고침: 브라우저 스크롤 복원 허용
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

// Loading Animation
// Loading Animation
function initCrispLoadingAnimation() {
  const container = document.querySelector(".crisp-header");
  if (!container) return;

  const headings = container.querySelectorAll(".crisp-header__h1");
  const revealImages = container.querySelectorAll(".crisp-loader__group > *");
  const isScaleUp = container.querySelectorAll(".crisp-loader__media");
  const isScaleDown = container.querySelectorAll(".crisp-loader__media .is--scale-down");
  const isRadius = container.querySelectorAll(".crisp-loader__media.is--scaling.is--radius");
  const sliderNav = container.querySelectorAll(".crisp-header__slider-nav > *");
  
  // Combine all elements to reveal at the end
  const smallElements = document.querySelectorAll(".crisp-header__p, .crisp-header__top");
  const mainHeader = document.querySelector(".main-header");
  
  // Force GSAP control over header from the start (overrides CSS)
  if (mainHeader) gsap.set(mainHeader, { opacity: 0, y: -20, pointerEvents: "none" });
  
  
  /* GSAP Timeline */
  const tl = gsap.timeline({
    defaults: {
      ease: "expo.inOut",
    },
    onStart: () => {
      container.classList.remove('is--hidden');
    }
  });

  // 0. Splash Animation (Logo First)
  const splash = container.querySelector(".crisp-splash");
  const splashLogo = container.querySelector(".crisp-splash__logo");

  if (splash && splashLogo) {
    tl.to(splashLogo, {
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power2.out"
    })
    .to(splashLogo, {
      opacity: 0,
      scale: 1.1,
      duration: 0.6,
      ease: "power2.in"
    }, "+=0.2")
    .to(splash, {
      autoAlpha: 0,
      duration: 0.5
    }, "-=0.1");
  }
  
  /* GSAP SplitText */
  let split;
  if (headings.length && typeof SplitText !== 'undefined') {
    // Refresh innerHTML before SplitText to ensure consistent text node creation
    headings.forEach(h => { h.innerHTML = h.innerHTML; });
    
    split = new SplitText(headings, {
      type: "words,chars",
      wordsClass: "split-word",
      charsClass: "split-char"
    });
    
    // Remove text node spaces SplitText inserted – spacing is handled by CSS margin-right
    headings.forEach(removeWordTextNodes);
  }
  
  /* Start of Timeline (follows splash) */
  if (revealImages.length) {
    tl.fromTo(revealImages, {
      xPercent: 500
    }, {
      xPercent: -500,
      duration: 2.5,
      stagger: 0.05
    }, ">");
  }
  
  if (isScaleDown.length) {
    tl.to(isScaleDown, {
      scale: 0.5,
      duration: 2,
      stagger: {
        each: 0.05,
        from: "edges",
        ease: "none"
      },
      onComplete: () => {
        if (isRadius) {
          isRadius.forEach(el => el.classList.remove('is--radius'));
        }
      }
    }, "-=0.1");
  }
  
  if (isScaleUp.length) {
    tl.fromTo(isScaleUp, {
      width: "10em",
      height: "10em"
    }, {
      width: "100vw",
      height: "100dvh",
      duration: 2
    }, "< 0.5");
  }
  
  if (sliderNav.length) {
    // isScaleUp 완전히 끝난 후 시작 (기존 "-=0.9" 겹침이 CPU 경합 → 끊김 원인)
    tl.from(sliderNav, {
      yPercent: 150,
      stagger: 0.05,
      ease: "expo.out",
      duration: 1
    }, ">"); // isScaleUp 종료 후 시작

    const scrollBtn = document.querySelector('.hero-scrolldown');
    if (scrollBtn) {
      tl.fromTo(scrollBtn,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, ease: "power2.out", duration: 0.8 },
        "<"
      );
    }
  }
  
  if (split && split.chars && split.chars.length) {
    gsap.set(headings, { opacity: 1 });
    gsap.set(split.chars, { opacity: 0 });

    tl.fromTo(split.chars, 
      { opacity: 0 }, 
      {
        duration: 1.2,
        opacity: 1,
        ease: "power1.inOut",
        stagger: { from: "center", each: 0.04 }
      }, 
      "< 0.1"
    );
    
    // words: 3초→1초로 단축 (3초 애니메이션이 isScaleUp과 겹쳐 CPU 과부하였음)
    tl.from(split.words, 
      { duration: 1, y: (i) => (i * 40) - 20, ease: "expo.out" }, 
      "<"
    );
    
  } else if (headings.length) {
    tl.to(headings, { opacity: 1, duration: 0.8 }, "< 0.1");
  }
  
  if (smallElements.length) {
    tl.to(smallElements, {
      opacity: 1,
      y: 0,
      pointerEvents: "auto",
      ease: "power1.inOut",
      duration: 0.8
    }, "< 0.15");
  }

  tl.call(function () {
    container.classList.remove('is--loading');
    if (mainHeader) gsap.set(mainHeader, { opacity: 1, y: 0, pointerEvents: 'auto' });
    if (typeof ScrollTrigger !== 'undefined') setTimeout(() => ScrollTrigger.refresh(), 100);
  }, null, "+=0.45");
}

// 인트로 재생 여부를 스크롤 위치로 결정
const _shouldPlayIntro = (scrollY) => scrollY < window.innerHeight * 0.25;

// 즉시 표시 (인트로 스킵)
function _skipIntro() {
  const container = document.querySelector('.crisp-header');
  if (container) container.classList.remove('is--loading');

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

  // 스킵 경로에서만 ScrollTrigger 재계산 (reload 후 스크롤 위치에 맞는 배경색 복원)
  if (typeof ScrollTrigger !== 'undefined') setTimeout(() => ScrollTrigger.refresh(), 100);
}

// fonts.ready 이후 인트로/스킵 결정
document.fonts.ready.then(() => {
  const decide = () => {
    if (_shouldPlayIntro(window.scrollY)) {
      initCrispLoadingAnimation();
    } else {
      _skipIntro();
    }
  };

  if (_isReload) {
    // 새로고침: 브라우저 스크롤 복원 완료 후 판단 (50ms 대기)
    setTimeout(decide, 50);
  } else {
    // 새 진입: 즉시 인트로 시작
    decide();
  }

  // ── 모바일 카드 플립: 클릭으로 토글 ──
  document.querySelectorAll('.refund-card').forEach(card => {
    card.addEventListener('click', function () {
      this.classList.toggle('is--flipped');
    });
  });
});

// ── Safari/모바일 안전망: fonts.ready가 발화하지 않거나 GSAP 실패 시 ──
// 6초 후에도 is--loading 상태면 강제 해제하여 콘텐츠를 표시
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
}, 6000);

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
