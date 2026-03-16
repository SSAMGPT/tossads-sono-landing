// Immediately scroll to top to prevent browser scroll restoration from showing below-fold content
window.scrollTo(0, 0);
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
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
    // Remove loading overlay and trigger header animation at the same moment thumbnails appear
    tl.call(function () {
      container.classList.remove('is--loading');
      // Header slides down from top, same timing as text/thumbnails
      gsap.fromTo(mainHeader,
        { opacity: 0, y: -30 },
        {
          opacity: 1,
          y: 0,
          pointerEvents: "auto",
          ease: "power2.out",
          duration: 1
        }
      );
    }, null, ">"); // fires right when isScaleUp ends
    
    tl.from(sliderNav, {
      yPercent: 150,
      stagger: 0.05,
      ease: "expo.out",
      duration: 1
    }, ">"); // right after isScaleUp ends
  }
  
  if (split && split.chars && split.chars.length) {
    // 1. Revert container opacity to 1 immediately so child animations can be seen.
    gsap.set(headings, { opacity: 1 });
    // 2. Hide all chars initially to prevent any flashes.
    gsap.set(split.chars, { opacity: 0 });

    // 3. Characters fade in from the center (staggered)
    tl.fromTo(split.chars, 
      { opacity: 0 }, 
      {
        duration: 1.2,
        opacity: 1,
        ease: "power1.inOut",
        stagger: { from: "center", each: 0.04 }
      }, 
      "<"
    );
    
    // 4. Words spring up (the 'explosion' effect)
    tl.from(split.words, 
      {
        duration: 3,
        y: (i) => (i * 100) - 50,
        ease: "expo.out"
      }, 
      "<"
    );
    
  } else if (headings.length) {
    tl.to(headings, { opacity: 1, duration: 0.8 }, "<");
  }
  
  if (smallElements.length) {
    tl.to(smallElements, {
      opacity: 1,
      y: 0,
      pointerEvents: "auto",
      ease: "power1.inOut",
      duration: 0.8
    }, "<");
  }
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
    
    // Revert any existing split
    if (currentSplit) { currentSplit.revert(); currentSplit = null; }

    // Animate out current text
    const exitSplit = new SplitText(heading, { type: 'chars', charsClass: 'split-char' });
    gsap.to(exitSplit.chars, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: { from: 'center', each: 0.02 },
      ease: 'power1.in',
      onComplete: () => {
        exitSplit.revert();
        // Update text content
        heading.innerHTML = newHTML;
        // Immediately hide the heading to prevent flash of unsplit text
        gsap.set(heading, { opacity: 0 });
        // Animate in new text
        currentSplit = new SplitText(heading, {
          type: 'words,chars',
          wordsClass: 'split-word',
          charsClass: 'split-char'
        });
        gsap.set(heading, { opacity: 1 }); // show container
        gsap.set(currentSplit.chars, { opacity: 0 }); // hide chars individually
        // Remove text node spaces so CSS margin-right is the sole spacing source
        removeWordTextNodes(heading);
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
      }
    });
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
