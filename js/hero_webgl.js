/**
 * hero_webgl.js — Demo1 Perlin-noise horizontal wipe (WebGL / Three.js)
 * 히어로 이미지 슬라이드를 WebGL로 전환. GSAP v3 사용.
 */
(function () {
  'use strict';

  var IMAGES = [
    'img/sono-hero-04.jpeg',   // 0  (default current)
    'img/sono-hero-02.jpeg',   // 1
    'img/sono-hero-03.jpeg',   // 2
    'img/sono-hero-05.jpeg',   // 3
    'img/sono-hero-01.jpeg',   // 4
  ];

  var AUTO_INTERVAL    = 5000;   // ms between auto-transitions
  var TRANS_DURATION   = 1.5;    // seconds for the wipe

  /* ── GLSL Shaders ── */
  var VERTEX_SHADER = [
    'varying vec2 vUv;',
    'void main(){',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
    '}'
  ].join('\n');

  /* Full Demo1 Perlin-4D fragment shader (same as the original demo1.js) */
  var FRAGMENT_SHADER = [
    'uniform float time;',
    'uniform float progress;',
    'uniform float width;',
    'uniform float scaleX;',
    'uniform float scaleY;',
    'uniform sampler2D texture1;',
    'uniform sampler2D texture2;',
    'uniform vec4 resolution;',
    'varying vec2 vUv;',

    'vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}',
    'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
    'vec4 fade(vec4 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}',
    'float cnoise(vec4 P){',
    '  vec4 Pi0=floor(P);vec4 Pi1=Pi0+1.0;',
    '  Pi0=mod(Pi0,289.0);Pi1=mod(Pi1,289.0);',
    '  vec4 Pf0=fract(P);vec4 Pf1=Pf0-1.0;',
    '  vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);',
    '  vec4 iy=vec4(Pi0.yy,Pi1.yy);',
    '  vec4 iz0=Pi0.zzzz;vec4 iz1=Pi1.zzzz;',
    '  vec4 iw0=Pi0.wwww;vec4 iw1=Pi1.wwww;',
    '  vec4 ixy=permute(permute(ix)+iy);',
    '  vec4 ixy0=permute(ixy+iz0);vec4 ixy1=permute(ixy+iz1);',
    '  vec4 ixy00=permute(ixy0+iw0);vec4 ixy01=permute(ixy0+iw1);',
    '  vec4 ixy10=permute(ixy1+iw0);vec4 ixy11=permute(ixy1+iw1);',
    '  vec4 gx00=ixy00/7.0;vec4 gy00=floor(gx00)/7.0;vec4 gz00=floor(gy00)/6.0;',
    '  gx00=fract(gx00)-0.5;gy00=fract(gy00)-0.5;gz00=fract(gz00)-0.5;',
    '  vec4 gw00=vec4(0.75)-abs(gx00)-abs(gy00)-abs(gz00);',
    '  vec4 sw00=step(gw00,vec4(0.0));',
    '  gx00-=sw00*(step(0.0,gx00)-0.5);gy00-=sw00*(step(0.0,gy00)-0.5);',
    '  vec4 gx01=ixy01/7.0;vec4 gy01=floor(gx01)/7.0;vec4 gz01=floor(gy01)/6.0;',
    '  gx01=fract(gx01)-0.5;gy01=fract(gy01)-0.5;gz01=fract(gz01)-0.5;',
    '  vec4 gw01=vec4(0.75)-abs(gx01)-abs(gy01)-abs(gz01);',
    '  vec4 sw01=step(gw01,vec4(0.0));',
    '  gx01-=sw01*(step(0.0,gx01)-0.5);gy01-=sw01*(step(0.0,gy01)-0.5);',
    '  vec4 gx10=ixy10/7.0;vec4 gy10=floor(gx10)/7.0;vec4 gz10=floor(gy10)/6.0;',
    '  gx10=fract(gx10)-0.5;gy10=fract(gy10)-0.5;gz10=fract(gz10)-0.5;',
    '  vec4 gw10=vec4(0.75)-abs(gx10)-abs(gy10)-abs(gz10);',
    '  vec4 sw10=step(gw10,vec4(0.0));',
    '  gx10-=sw10*(step(0.0,gx10)-0.5);gy10-=sw10*(step(0.0,gy10)-0.5);',
    '  vec4 gx11=ixy11/7.0;vec4 gy11=floor(gx11)/7.0;vec4 gz11=floor(gy11)/6.0;',
    '  gx11=fract(gx11)-0.5;gy11=fract(gy11)-0.5;gz11=fract(gz11)-0.5;',
    '  vec4 gw11=vec4(0.75)-abs(gx11)-abs(gy11)-abs(gz11);',
    '  vec4 sw11=step(gw11,vec4(0.0));',
    '  gx11-=sw11*(step(0.0,gx11)-0.5);gy11-=sw11*(step(0.0,gy11)-0.5);',
    '  vec4 g0000=vec4(gx00.x,gy00.x,gz00.x,gw00.x);',
    '  vec4 g1000=vec4(gx00.y,gy00.y,gz00.y,gw00.y);',
    '  vec4 g0100=vec4(gx00.z,gy00.z,gz00.z,gw00.z);',
    '  vec4 g1100=vec4(gx00.w,gy00.w,gz00.w,gw00.w);',
    '  vec4 g0010=vec4(gx10.x,gy10.x,gz10.x,gw10.x);',
    '  vec4 g1010=vec4(gx10.y,gy10.y,gz10.y,gw10.y);',
    '  vec4 g0110=vec4(gx10.z,gy10.z,gz10.z,gw10.z);',
    '  vec4 g1110=vec4(gx10.w,gy10.w,gz10.w,gw10.w);',
    '  vec4 g0001=vec4(gx01.x,gy01.x,gz01.x,gw01.x);',
    '  vec4 g1001=vec4(gx01.y,gy01.y,gz01.y,gw01.y);',
    '  vec4 g0101=vec4(gx01.z,gy01.z,gz01.z,gw01.z);',
    '  vec4 g1101=vec4(gx01.w,gy01.w,gz01.w,gw01.w);',
    '  vec4 g0011=vec4(gx11.x,gy11.x,gz11.x,gw11.x);',
    '  vec4 g1011=vec4(gx11.y,gy11.y,gz11.y,gw11.y);',
    '  vec4 g0111=vec4(gx11.z,gy11.z,gz11.z,gw11.z);',
    '  vec4 g1111=vec4(gx11.w,gy11.w,gz11.w,gw11.w);',
    '  vec4 n00=taylorInvSqrt(vec4(dot(g0000,g0000),dot(g0100,g0100),dot(g1000,g1000),dot(g1100,g1100)));',
    '  g0000*=n00.x;g0100*=n00.y;g1000*=n00.z;g1100*=n00.w;',
    '  vec4 n01=taylorInvSqrt(vec4(dot(g0001,g0001),dot(g0101,g0101),dot(g1001,g1001),dot(g1101,g1101)));',
    '  g0001*=n01.x;g0101*=n01.y;g1001*=n01.z;g1101*=n01.w;',
    '  vec4 n10=taylorInvSqrt(vec4(dot(g0010,g0010),dot(g0110,g0110),dot(g1010,g1010),dot(g1110,g1110)));',
    '  g0010*=n10.x;g0110*=n10.y;g1010*=n10.z;g1110*=n10.w;',
    '  vec4 n11=taylorInvSqrt(vec4(dot(g0011,g0011),dot(g0111,g0111),dot(g1011,g1011),dot(g1111,g1111)));',
    '  g0011*=n11.x;g0111*=n11.y;g1011*=n11.z;g1111*=n11.w;',
    '  float f0=dot(g0000,Pf0);',
    '  float f1=dot(g1000,vec4(Pf1.x,Pf0.yzw));',
    '  float f2=dot(g0100,vec4(Pf0.x,Pf1.y,Pf0.zw));',
    '  float f3=dot(g1100,vec4(Pf1.xy,Pf0.zw));',
    '  float f4=dot(g0010,vec4(Pf0.xy,Pf1.z,Pf0.w));',
    '  float f5=dot(g1010,vec4(Pf1.x,Pf0.y,Pf1.z,Pf0.w));',
    '  float f6=dot(g0110,vec4(Pf0.x,Pf1.yz,Pf0.w));',
    '  float f7=dot(g1110,vec4(Pf1.xyz,Pf0.w));',
    '  float f8=dot(g0001,vec4(Pf0.xyz,Pf1.w));',
    '  float f9=dot(g1001,vec4(Pf1.x,Pf0.yz,Pf1.w));',
    '  float fa=dot(g0101,vec4(Pf0.x,Pf1.y,Pf0.z,Pf1.w));',
    '  float fb=dot(g1101,vec4(Pf1.xy,Pf0.z,Pf1.w));',
    '  float fc=dot(g0011,vec4(Pf0.xy,Pf1.zw));',
    '  float fd=dot(g1011,vec4(Pf1.x,Pf0.y,Pf1.zw));',
    '  float fe=dot(g0111,vec4(Pf0.x,Pf1.yzw));',
    '  float ff=dot(g1111,Pf1);',
    '  vec4 fv=fade(Pf0);',
    '  vec4 nw=mix(vec4(f0,f1,f2,f3),vec4(f8,f9,fa,fb),fv.w);',
    '  vec4 nx=mix(vec4(f4,f5,f6,f7),vec4(fc,fd,fe,ff),fv.w);',
    '  vec4 nz=mix(nw,nx,fv.z);',
    '  vec2 ny=mix(nz.xy,nz.zw,fv.y);',
    '  return 2.2*mix(ny.x,ny.y,fv.x);',
    '}',

    'float parabola(float x,float k){return pow(4.0*x*(1.0-x),k);}',

    'void main(){',
    '  float dt=parabola(progress,1.0);',
    '  vec2 nuv=(vUv-vec2(0.5))*resolution.zw+vec2(0.5);',
    '  vec4 c1=texture2D(texture1,nuv);',
    '  vec4 c2=texture2D(texture2,nuv);',
    '  float noise=0.5*(cnoise(vec4(nuv.x*scaleX,nuv.y*scaleY,0.0,0.0))+1.0);',
    '  float w=width*dt;',
    '  float mv=smoothstep(1.0-w,1.0,vUv.x+mix(-w/2.0,1.0-w/2.0,progress));',
    '  float mask=mv+mv*noise;',
    '  float fin=smoothstep(1.0,1.01,mask);',
    '  gl_FragColor=mix(c1,c2,fin);',
    '}'
  ].join('\n');

  /* ── HeroWebGL Constructor ── */
  function HeroWebGL(containerId) {
    this.container   = document.getElementById(containerId);
    this.progressEl  = document.getElementById('hero-progress-line');
    this.progressBar = document.getElementById('hero-progress-bar');

    if (!this.container || typeof THREE === 'undefined') {
      console.warn('[HeroWebGL] THREE.js not loaded or container missing');
      return;
    }

    this.images      = IMAGES;
    this.textures    = [];
    this.current     = 0;
    this.isRunning   = false;
    this._stopped    = false;
    this._paused     = true;
    this._time       = 0;
    this._autoTimer  = null;

    this._build();
  }

  HeroWebGL.prototype._build = function () {
    var self = this;
    var w = this.container.offsetWidth  || window.innerWidth;
    var h = this.container.offsetHeight || window.innerHeight;

    /* Renderer */
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0xeaeaea, 1);  /* 스플래시 배경색과 동일 */
    this.container.appendChild(this.renderer.domElement);

    /* Camera */
    this.camera = new THREE.PerspectiveCamera(70, w / h, 0.001, 1000);
    this.camera.position.z = 2;

    /* Scene */
    this.scene = new THREE.Scene();

    /* Material */
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time:       { type: 'f', value: 0 },
        progress:   { type: 'f', value: 0 },
        width:      { type: 'f', value: 0.5 },
        scaleX:     { type: 'f', value: 40 },
        scaleY:     { type: 'f', value: 40 },
        texture1:   { type: 't', value: null },
        texture2:   { type: 't', value: null },
        resolution: { type: 'v4', value: new THREE.Vector4() }
      },
      vertexShader:   VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.DoubleSide
    });

    /* Geometry */
    this.geometry = new THREE.PlaneGeometry(1, 1, 2, 2);
    this.plane    = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);

    /* Load all textures */
    var loaded  = 0;
    var loader  = new THREE.TextureLoader();
    this.images.forEach(function (url, i) {
      loader.load(url, function (tex) {
        self.textures[i] = tex;
        loaded++;
        if (loaded === self.images.length) self._onReady();
      });
    });

    window.addEventListener('resize', this._onResize.bind(this));
  };

  HeroWebGL.prototype._onReady = function () {
    /* 스플래시 배경색(#eaeaea)으로 저리 쳭리 뺜리텍스쳐 생성 */
    var bgCanvas    = document.createElement('canvas');
    bgCanvas.width  = 4; bgCanvas.height = 4;
    var bgCtx = bgCanvas.getContext('2d');
    bgCtx.fillStyle = '#eaeaea';
    bgCtx.fillRect(0, 0, 4, 4);
    this._bgTex = new THREE.CanvasTexture(bgCanvas);

    /* WebGL 쾔럿: 스플래시와 동일한 배경색 표시 (스플래시 사라진 후 색상 일치) */
    this.material.uniforms.texture1.value = this._bgTex;
    this.material.uniforms.texture2.value = this._bgTex;

    this._resize();
    this._paused = false;
    this._render();

    /* hero_sono.js에 WebGL 준비 완료 알림 */
    window._heroWebGLIsReady = true;
    if (typeof window._heroWebGLReadyCallback === 'function') {
      window._heroWebGLReadyCallback();
      window._heroWebGLReadyCallback = null;
    }
  };

  HeroWebGL.prototype._resize = function () {
    var w = this.container.offsetWidth  || window.innerWidth;
    var h = this.container.offsetHeight || window.innerHeight;

    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;

    if (this.textures[0] && this.textures[0].image) {
      var imgRatio = this.textures[0].image.height / this.textures[0].image.width;
      var a1, a2;
      if (h / w > imgRatio) { a1 = (w / h) * imgRatio; a2 = 1; }
      else                  { a1 = 1; a2 = (h / w) / imgRatio; }
      this.material.uniforms.resolution.value.set(w, h, a1, a2);
    }

    var dist = this.camera.position.z;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(1 / (2 * dist));
    this.plane.scale.x = this.camera.aspect;
    this.plane.scale.y = 1;
    this.camera.updateProjectionMatrix();
  };

  HeroWebGL.prototype._onResize = function () { this._resize(); };

  HeroWebGL.prototype._render = function () {
    if (this._paused) return;
    this._time += 0.05;
    this.material.uniforms.time.value = this._time;
    requestAnimationFrame(this._render.bind(this));
    this.renderer.render(this.scene, this.camera);
  };

  HeroWebGL.prototype.introTransition = function (callback) {
    var self = this;
    if (!this.textures.length) return;

    /* texture1 = 스플래시 배경색(#eaeaea), texture2 = 첫 번째 이미지 */
    this.material.uniforms.texture1.value = this._bgTex;
    this.material.uniforms.texture2.value = this.textures[0];
    this.material.uniforms.progress.value = 0;

    /* 쿬오버 이후에도 오버라이드병에도 _bgTex 결해야 하므로 resize 업데이트 */
    this._resize();

    gsap.to(this.material.uniforms.progress, {
      value: 1,
      duration: TRANS_DURATION,
      ease: 'power2.out',
      onComplete: function () {
        self.material.uniforms.texture1.value = self.textures[0];
        self.material.uniforms.progress.value = 0;
        self.isRunning = false;
        if (typeof callback === 'function') callback();
      }
    });
  };

  /**
   * next — transition to next image (or targetIndex)
   */
  HeroWebGL.prototype.next = function (targetIndex, callback) {
    if (this.isRunning || !this.textures.length) return;
    this.isRunning = true;

    var len     = this.textures.length;
    var nextIdx = (targetIndex !== undefined && targetIndex !== null)
                  ? targetIndex
                  : (this.current + 1) % len;
    var nextTex = this.textures[nextIdx];
    var self    = this;

    this.material.uniforms.texture2.value = nextTex;
    this.material.uniforms.progress.value = 0;

    gsap.to(this.material.uniforms.progress, {
      value: 1,
      duration: TRANS_DURATION,
      ease: 'power2.out',
      onComplete: function () {
        self.current = nextIdx;
        self.material.uniforms.texture1.value = nextTex;
        self.material.uniforms.progress.value = 0;
        self.isRunning = false;
        if (typeof callback === 'function') callback();
      }
    });
  };

  /** startAutoplay — auto-advance every AUTO_INTERVAL ms with progress bar */
  HeroWebGL.prototype.startAutoplay = function () {
    var self = this;
    this._resetProgressBar();   // start first bar immediately

    function tick() {
      if (self._stopped) return;
      self.next(null, function () {
        self._resetProgressBar();
        self._autoTimer = setTimeout(tick, AUTO_INTERVAL);
      });
    }
    this._autoTimer = setTimeout(tick, AUTO_INTERVAL);
  };

  HeroWebGL.prototype._resetProgressBar = function () {
    var el = this.progressEl;
    if (!el) return;
    /* Reset → force reflow → animate */
    el.style.transition = 'none';
    el.style.width = '0%';
    void el.offsetWidth;  // force reflow
    el.style.transition = 'width ' + AUTO_INTERVAL + 'ms linear';
    el.style.width = '100%';

    /* Show bar container */
    if (this.progressBar) this.progressBar.style.opacity = '1';
  };

  HeroWebGL.prototype.stop = function () {
    this._stopped = true;
    if (this._autoTimer) clearTimeout(this._autoTimer);
    this._paused = true;
  };

  /* ── Expose globally ── */
  window.HeroWebGL = HeroWebGL;

})();
