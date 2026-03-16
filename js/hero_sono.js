// Register GSAP plugins
if (typeof SplitText !== 'undefined' && typeof CustomEase !== 'undefined') {
  gsap.registerPlugin(SplitText, CustomEase);
  CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");
}

// Loading Animation
function initCrispLoadingAnimation() {
  const container = document.querySelector(".crisp-header");
  if (!container) return;

  const headings = container.querySelectorAll(".crisp-header__h1");
  const revealImages = container.querySelectorAll(".crisp-loader__group > *");
  const isScaleUp = container.querySelectorAll(".crisp-loader__media");
  const isScaleDown = container.querySelectorAll(".crisp-loader__media .is--scale-down");
  const isRadius = container.querySelectorAll(".crisp-loader__media.is--scaling.is--radius");
  const smallElements = container.querySelectorAll(".crisp-header__top, .crisp-header__p");
  const sliderNav = container.querySelectorAll(".crisp-header__slider-nav > *");
  
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
      duration: 1.2,
      ease: "power2.out"
    })
    .to(splashLogo, {
      opacity: 0,
      scale: 1.1,
      duration: 0.8,
      ease: "power2.in"
    }, "+=0.3")
    .to(splash, {
      autoAlpha: 0,
      duration: 0.5
    }, "-=0.2");
  }
  
  /* GSAP SplitText Setup */
  let split;
  if (headings.length && typeof SplitText !== 'undefined') {
    // 1. Split text into words with a dedicated class for spacing
    split = new SplitText(headings, {
      type: "words",
      wordsClass: "sono-word"
    });

    // 2. Set initial state of words hidden below the masking container
    gsap.set(split.words, {
      yPercent: 110,
    });

    // 3. Keep it hidden for now (will be revealed in the timeline)
    gsap.set(headings, { autoAlpha: 0 });
  }
  
  /* Start of Timeline */
  if (revealImages.length) {
    tl.fromTo(revealImages, {
      xPercent: 500
    }, {
      xPercent: -500,
      duration: 2.5,
      stagger: 0.05
    });
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
    tl.from(sliderNav, {
      yPercent: 150,
      stagger: 0.05,
      ease: "expo.out",
      duration: 1
    }, "-=0.9");
  }
  
  if (split && split.words.length) {
    // Reveal the container just before the words start moving
    tl.set(headings, { autoAlpha: 1 }, "<");
    
    tl.fromTo(split.words, {
      yPercent: 110
    }, {
      yPercent: 0,
      stagger: 0.1,
      ease: "expo.out",
      duration: 1.2
    }, "< 0.1");
  }
  
  if (smallElements.length) {
    tl.from(smallElements, {
      opacity: 0,
      ease: "power1.inOut",
      duration: 0.2
    }, "< 0.15");
  }

  // Header Reveal: Fade In & Up
  tl.to(".main-header", {
    opacity: 1,
    y: 0,
    pointerEvents: "auto",
    duration: 1.2,
    ease: "power3.out"
  }, "-=0.8");
  
  tl.call(function () {
    container.classList.remove('is--loading');
  }, null, "+=0.45");
}

// Initialize Crisp Loading Animation
document.fonts.ready.then(() => {
  initCrispLoadingAnimation();
});

// Slideshow
function initSlideShow(el) {
  const ui = {
    el,
    slides: Array.from(el.querySelectorAll('[data-slideshow="slide"]')),
    inner: Array.from(el.querySelectorAll('[data-slideshow="parallax"]')),
    thumbs: Array.from(el.querySelectorAll('[data-slideshow="thumb"]'))
  };

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
