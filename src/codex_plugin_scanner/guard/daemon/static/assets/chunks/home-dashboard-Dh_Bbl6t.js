import { r as reactExports, j as jsxRuntimeExports, S as SectionLabel, H as HiMiniChevronRight, f as formatRelativeTime, h as harnessDisplayName, a as formatNumber, n as normalizeHarnessSlug, b as HiMiniChevronUp, c as HiMiniChevronDown, A as ActionButton, d as HiMiniPlay, e as HiMiniEye, g as HiMiniHandRaised, i as HiMiniDocumentCheck, B as Badge, k as HiMiniCheckCircle, T as Tag, l as isConnectableAppHarness, m as HiMiniLockClosed, o as getHeatmapLevel, E as EvidenceInsightsShareButton, G as GuardStatMetric, p as HomeInsightsMetrics, q as EvidenceActivityHeatmapMini, s as homeCommandActivityModel, t as HiMiniCommandLine, u as createCommandActivityClient, v as fetchCommandActivityApi, w as queueErrorIsUnauthorizedSession, x as useReceiptAnalytics, y as updateSettings, z as turnProtectionOnUpdate, C as useProtectionPresentationState, D as protectionHealthFor, F as unavailableProtectionHealth, I as EmptyState, J as watchBannerModel, W as WatchProtectionBanner, K as EvidenceInsightsShareModal, O as OperatorHealthCard, L as HiMiniShieldCheck, M as DeviceProofCard, N as guardActionDisposition, P as approvalLeftActionStopped, Q as guardActionActivityCopy, R as HiMiniSparkles, U as HiMiniXMark, V as resolveCloudIntelCopy, X as HiMiniCloud, Y as HiMiniQuestionMarkCircle, Z as useFocusTrap, _ as approvalProofRequiresPassword, $ as HiMiniExclamationTriangle, a0 as HiMiniBolt, a1 as HiMiniMinusCircle } from "../guard-dashboard.js";
import { H as HomeProtectionModule } from "./home-protection-module-D_ErUZ_c.js";
import { A as ABOUT_LOCAL_SECTION_TITLE, a as ABOUT_LOCAL_SECTION_BODY } from "./about-content-BwtrHEyh.js";
import { S as SUPPORTED_APPS_FULL } from "./app-catalog-D-lQIe_k.js";
const ANGLES = [90, 30, -30, -90, -150, 150].map((deg) => deg * Math.PI / 180);
const OUTER_NODE_RADIUS = 0.128;
const INNER_NODE_RADIUS = 0.156;
const INNER_RING_RADIUS = 0.59;
const INNER_RING_CENTER = { x: 0, y: -0.044 };
const CORE_CENTER = { x: 0, y: -9e-3 };
const THICK_BAR = 0.163;
const THIN_BAR = 0.062;
const BAR_GAP = 0.055;
const MIN_BAR_LENGTH = 0.012;
function buildBrandMarkGeometry() {
  const outer = ANGLES.map((a) => ({ x: Math.cos(a), y: Math.sin(a), r: OUTER_NODE_RADIUS, kind: "outer" }));
  const inner = ANGLES.map((a) => ({
    x: INNER_RING_CENTER.x + INNER_RING_RADIUS * Math.cos(a),
    y: INNER_RING_CENTER.y + INNER_RING_RADIUS * Math.sin(a),
    r: INNER_NODE_RADIUS,
    kind: "inner"
  }));
  const core = { x: CORE_CENTER.x, y: CORE_CENTER.y, r: INNER_NODE_RADIUS, kind: "core" };
  const bars = [];
  function addBar(a, b, w, kind) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const ux = dx / length;
    const uy = dy / length;
    const s0 = a.r + BAR_GAP;
    const s1 = length - (b.r + BAR_GAP);
    if (s1 - s0 < MIN_BAR_LENGTH) return;
    bars.push({ x1: a.x + ux * s0, y1: a.y + uy * s0, x2: a.x + ux * s1, y2: a.y + uy * s1, w, len: s1 - s0, kind });
  }
  for (let i = 0; i < 6; i += 1) {
    addBar(outer[i], outer[(i + 1) % 6], THICK_BAR, "ring");
    addBar(inner[i], inner[(i + 1) % 6], THIN_BAR, "inner");
    addBar(core, inner[i], THIN_BAR, "spoke");
    addBar(outer[i], inner[i], THIN_BAR, "radial");
  }
  return { discs: [...outer, ...inner, core], bars };
}
const BRAND_MARK = buildBrandMarkGeometry();
function brandMarkKindAt(geometry, x, y) {
  for (const disc of geometry.discs) {
    const dx = x - disc.x;
    const dy = y - disc.y;
    if (dx * dx + dy * dy <= disc.r * disc.r) {
      return disc.kind === "core" ? 3 : disc.kind === "inner" ? 2 : 1;
    }
  }
  for (const bar of geometry.bars) {
    const ux = (bar.x2 - bar.x1) / bar.len;
    const uy = (bar.y2 - bar.y1) / bar.len;
    const dx = x - bar.x1;
    const dy = y - bar.y1;
    const along = dx * ux + dy * uy;
    if (along < 0 || along > bar.len) continue;
    const across = -dx * uy + dy * ux;
    if (Math.abs(across) <= bar.w / 2) return 0;
  }
  return -1;
}
function sampleBrandMarkParticles(geometry, spacing, random = Math.random) {
  const home = [];
  const kinds = [];
  const extent = 1.2;
  for (let gy = -extent; gy <= extent; gy += spacing) {
    for (let gx = -extent; gx <= extent; gx += spacing) {
      const x = gx + (random() - 0.5) * spacing * 0.7;
      const y = gy + (random() - 0.5) * spacing * 0.7;
      const kind = brandMarkKindAt(geometry, x, y);
      if (kind < 0) continue;
      home.push(x, y);
      kinds.push(kind);
    }
  }
  return { count: kinds.length, home: Float32Array.from(home), kinds: Uint8Array.from(kinds) };
}
function brandMarkSvg(color, className = "") {
  const c = 50;
  const k = 42;
  const bars = BRAND_MARK.bars.map(
    (bar) => `<line class="bm-bar-${bar.kind}" x1="${(c + bar.x1 * k).toFixed(2)}" y1="${(c - bar.y1 * k).toFixed(2)}" x2="${(c + bar.x2 * k).toFixed(2)}" y2="${(c - bar.y2 * k).toFixed(2)}" stroke="${color}" stroke-width="${(bar.w * k).toFixed(2)}"/>`
  ).join("");
  const discs = BRAND_MARK.discs.map(
    (disc) => `<circle class="bm-node-${disc.kind}" cx="${(c + disc.x * k).toFixed(2)}" cy="${(c - disc.y * k).toFixed(2)}" r="${(disc.r * k).toFixed(2)}" fill="${color}"/>`
  ).join("");
  return `<svg viewBox="0 0 100 100" class="${className}" aria-hidden="true">${bars}${discs}</svg>`;
}
const BRAND_BLUE = "#5599fe";
const BRAND_PURPLE = "#b56cff";
const BRAND_GREEN = "#48df7b";
const BRAND_NAVY = "#3f4174";
const BRAND_AMBER = "#f59e0b";
const VIEW_EXTENT = 1.3;
const PARTICLE_SPACING = 0.0125;
const CURSOR_RADIUS = 0.3;
const SPRING = 0.055;
const DAMPING = 0.84;
const SHIMMER = 35e-4;
const ASSEMBLY_MS = 1500;
const VERTEX_SHADER = `
precision mediump float;
attribute vec2 aPosition; attribute vec2 aHome; attribute float aSize; attribute vec3 aColor; attribute float aKind;
uniform float uExtent; uniform float uScale; uniform vec2 uMouse; uniform float uMouseR; uniform vec3 uTint;
uniform float uPulseR; uniform float uPulseW; uniform float uPulseAmt; uniform vec3 uPulseColor;
uniform float uCoreGlow; uniform vec3 uGlowColor;
varying vec3 vColor; varying float vAlpha;
void main() {
  gl_Position = vec4(aPosition / uExtent, 0.0, 1.0);
  float near = 1.0 - smoothstep(0.0, uMouseR, distance(aPosition, uMouse));
  float dc = length(aHome - vec2(0.0, -0.02));
  float pulse = (1.0 - smoothstep(0.0, uPulseW, abs(dc - uPulseR))) * uPulseAmt;
  vec3 c = aColor;
  if (aKind > 2.5) { c = mix(c, uGlowColor, uCoreGlow * 0.35); }
  c = mix(c, uPulseColor, pulse);
  c = mix(c, uTint, near * 0.85);
  vColor = c;
  float disp = length(aPosition - aHome);
  vAlpha = clamp(1.0 - disp * 0.7, 0.3, 1.0);
  gl_PointSize = aSize * uScale * (1.0 + near * 0.5 + pulse * 0.6 + (aKind > 2.5 ? uCoreGlow * 0.4 : 0.0));
}`;
const FRAGMENT_SHADER = `
precision mediump float;
varying vec3 vColor; varying float vAlpha; uniform float uAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = 1.0 - smoothstep(0.62, 1.0, d);
  if (a < 0.02) discard;
  gl_FragColor = vec4(vColor, a * vAlpha * uAlpha);
}`;
function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
}
function lerpRgb(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function lighten(c, amount) {
  const target = amount >= 0 ? [1, 1, 1] : [0, 0, 0];
  return lerpRgb(c, target, Math.min(1, Math.abs(amount)));
}
function brandGradientAt(x, y) {
  const t = Math.min(1, Math.max(0, (x - y) / 2.6 + 0.5));
  return t < 0.5 ? lerpRgb(hexToRgb(BRAND_BLUE), hexToRgb(BRAND_PURPLE), t * 2) : lerpRgb(hexToRgb(BRAND_PURPLE), hexToRgb(BRAND_GREEN), (t - 0.5) * 2);
}
function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
function createParticleScene(canvas, stage, onContextLost) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
  if (!gl) return null;
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const particles = sampleBrandMarkParticles(BRAND_MARK, PARTICLE_SPACING);
  const count = particles.count;
  const home = particles.home;
  const position = new Float32Array(count * 2);
  const velocity = new Float32Array(count * 2);
  const start = new Float32Array(count * 2);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const kinds = new Float32Array(count);
  const phase = new Float32Array(count);
  const order = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const sparkle = Math.random() < 0.03;
    sizes[i] = sparkle ? 0.019 + Math.random() * 6e-3 : 0.0105 + Math.random() * 5e-3;
    phase[i] = Math.random() * Math.PI * 2;
    kinds[i] = particles.kinds[i];
    order[i] = Math.hypot(home[i * 2], home[i * 2 + 1] + 0.02) / 1.15;
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.6 + Math.random() * 1.2;
    start[i * 2] = Math.cos(angle) * radius;
    start[i * 2 + 1] = Math.sin(angle) * radius;
    position[i * 2] = start[i * 2];
    position[i * 2 + 1] = start[i * 2 + 1];
  }
  const buffers = [];
  function attribute(name, data, size, usage) {
    const buffer = gl.createBuffer();
    const location = gl.getAttribLocation(program, name);
    if (buffer) buffers.push(buffer);
    if (!buffer || location < 0) return null;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return buffer;
  }
  const positionBuffer = attribute("aPosition", position, 2, gl.DYNAMIC_DRAW);
  attribute("aHome", home, 2, gl.STATIC_DRAW);
  attribute("aSize", sizes, 1, gl.STATIC_DRAW);
  const colorBuffer = attribute("aColor", colors, 3, gl.STATIC_DRAW);
  attribute("aKind", kinds, 1, gl.STATIC_DRAW);
  const uniform = (name) => gl.getUniformLocation(program, name);
  const uExtent = uniform("uExtent");
  const uScale = uniform("uScale");
  const uAlpha = uniform("uAlpha");
  const uMouse = uniform("uMouse");
  const uMouseR = uniform("uMouseR");
  const uTint = uniform("uTint");
  const uPulseR = uniform("uPulseR");
  const uPulseW = uniform("uPulseW");
  const uPulseAmt = uniform("uPulseAmt");
  const uPulseColor = uniform("uPulseColor");
  const uCoreGlow = uniform("uCoreGlow");
  const uGlowColor = uniform("uGlowColor");
  gl.uniform1f(uExtent, VIEW_EXTENT);
  gl.uniform1f(uMouseR, CURSOR_RADIUS);
  gl.uniform1f(uPulseW, 0.07);
  gl.enable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  const state = {
    mood: "clear",
    finish: "navy",
    motion: true,
    assembling: true,
    assemblyStart: performance.now(),
    visible: true,
    frame: 0,
    last: performance.now(),
    pulseRadius: -1,
    pulseAmount: 0,
    pulseCountdown: 1800,
    glow: 0,
    size: 0
  };
  const mouse = { x: 99, y: 99, lastX: 99, lastY: 99, active: false };
  function applyFinish() {
    const finish = state.finish;
    for (let i = 0; i < count; i += 1) {
      const j = phase[i] / (Math.PI * 2);
      let color;
      if (finish === "navy") {
        color = lighten(hexToRgb(BRAND_NAVY), (j - 0.5) * 0.32);
        if (j > 0.955) color = hexToRgb(BRAND_BLUE);
        else if (j < 0.02) color = hexToRgb(BRAND_PURPLE);
      } else if (finish === "white") {
        color = lighten([1, 1, 1], -j * 0.12);
        if (j > 0.96) color = hexToRgb("#dbe8ff");
      } else {
        color = lighten(brandGradientAt(home[i * 2], home[i * 2 + 1]), (j - 0.5) * 0.2);
      }
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    if (finish === "white") gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(uAlpha, finish === "white" ? 0.85 : 0.96);
    const tint = hexToRgb(finish === "navy" ? BRAND_BLUE : "#ffffff");
    gl.uniform3f(uTint, tint[0], tint[1], tint[2]);
    applyMood();
  }
  function applyMood() {
    const pulse = hexToRgb(state.mood === "review" ? BRAND_AMBER : state.finish === "white" ? "#ffffff" : BRAND_BLUE);
    const glow = hexToRgb(state.mood === "review" ? "#ffd58a" : state.mood === "setup" ? "#dbe8ff" : BRAND_GREEN);
    gl.uniform3f(uPulseColor, pulse[0], pulse[1], pulse[2]);
    gl.uniform3f(uGlowColor, glow[0], glow[1], glow[2]);
    requestFrame();
  }
  function step(now) {
    const dt = Math.min(0.05, (now - state.last) / 1e3);
    state.last = now;
    const t = now / 1e3;
    const frames = dt * 60;
    const damping = Math.pow(DAMPING, frames);
    const radius2 = CURSOR_RADIUS * CURSOR_RADIUS;
    const mouseVx = mouse.active ? mouse.x - mouse.lastX : 0;
    const mouseVy = mouse.active ? mouse.y - mouse.lastY : 0;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    const drag = Math.min(0.08, Math.hypot(mouseVx, mouseVy)) * 0.9;
    const shimmer = state.motion ? SHIMMER : 0;
    if (state.assembling) {
      const elapsed = (now - state.assemblyStart) / ASSEMBLY_MS;
      let done = true;
      for (let i = 0; i < count; i += 1) {
        const p = Math.min(1, Math.max(0, (elapsed - order[i] * 0.55) / 0.75));
        if (p < 1) done = false;
        const e = easeOutExpo(p);
        position[i * 2] = start[i * 2] + (home[i * 2] - start[i * 2]) * e;
        position[i * 2 + 1] = start[i * 2 + 1] + (home[i * 2 + 1] - start[i * 2 + 1]) * e;
      }
      if (done) {
        state.assembling = false;
        velocity.fill(0);
      }
    } else {
      for (let i = 0; i < count; i += 1) {
        const ix = i * 2;
        let px = position[ix];
        let py = position[ix + 1];
        let vx = velocity[ix];
        let vy = velocity[ix + 1];
        const hx = home[ix] + Math.sin(t * 0.8 + phase[i]) * shimmer;
        const hy = home[ix + 1] + Math.cos(t * 0.65 + phase[i] * 1.7) * shimmer;
        if (mouse.active) {
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius2) {
            const d = Math.sqrt(d2) + 1e-4;
            const s = 1 - d / CURSOR_RADIUS;
            const force = s * s * 0.028 * frames;
            vx += dx / d * force + mouseVx * s * drag * 0.35;
            vy += dy / d * force + mouseVy * s * drag * 0.35;
          }
        }
        vx += (hx - px) * SPRING * frames;
        vy += (hy - py) * SPRING * frames;
        vx *= damping;
        vy *= damping;
        px += vx * frames;
        py += vy * frames;
        position[ix] = px;
        position[ix + 1] = py;
        velocity[ix] = vx;
        velocity[ix + 1] = vy;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, position);
    if (state.motion && !state.assembling && state.mood !== "review") {
      state.pulseCountdown -= dt * 1e3;
      if (state.pulseCountdown <= 0 && state.pulseAmount <= 0) {
        state.pulseRadius = 1.18;
        state.pulseAmount = 0.55;
        state.pulseCountdown = state.mood === "setup" ? 3200 + Math.random() * 1500 : 2200 + Math.random() * 1200;
      }
      if (state.pulseAmount > 0) {
        state.pulseRadius -= dt * 1.05;
        if (state.pulseRadius < 0.02) {
          state.pulseAmount = 0;
          state.glow = 1;
        }
      }
    }
    state.glow = Math.max(0, state.glow - dt * 1.4);
    gl.uniform1f(uPulseR, state.pulseAmount > 0 ? state.pulseRadius : -5);
    gl.uniform1f(uPulseAmt, state.pulseAmount);
    gl.uniform1f(uCoreGlow, state.mood === "review" ? 0.25 + 0.2 * Math.sin(t * 2.4) : state.glow);
    gl.uniform2f(uMouse, mouse.active ? mouse.x : 99, mouse.active ? mouse.y : 99);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  }
  function loop(now) {
    state.frame = 0;
    step(now);
    if (state.motion && state.visible) state.frame = requestAnimationFrame(loop);
  }
  function requestFrame() {
    if (!state.frame && !lost) state.frame = requestAnimationFrame(loop);
  }
  function toMarkUnits(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2 * VIEW_EXTENT,
      y: -((event.clientY - rect.top) / rect.height - 0.5) * 2 * VIEW_EXTENT
    };
  }
  const onPointerMove = (event) => {
    if (!state.motion) return;
    const p = toMarkUnits(event);
    if (!mouse.active) {
      mouse.lastX = p.x;
      mouse.lastY = p.y;
    }
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.active = true;
    requestFrame();
  };
  const onPointerLeave = () => {
    mouse.active = false;
    requestFrame();
  };
  const onPointerDown = (event) => {
    if (!state.motion || state.assembling) return;
    const p = toMarkUnits(event);
    for (let i = 0; i < count; i += 1) {
      const dx = position[i * 2] - p.x;
      const dy = position[i * 2 + 1] - p.y;
      const d = Math.hypot(dx, dy) + 1e-4;
      if (d < 0.75) {
        const s = 1 - d / 0.75;
        velocity[i * 2] += dx / d * s * (0.06 + Math.random() * 0.05);
        velocity[i * 2 + 1] += dy / d * s * (0.06 + Math.random() * 0.05);
      }
    }
    state.glow = 1;
    requestFrame();
  };
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  let lost = false;
  const onWebglContextLost = (event) => {
    event.preventDefault();
    lost = true;
    if (state.frame) cancelAnimationFrame(state.frame);
    state.frame = 0;
    onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onWebglContextLost);
  function resize() {
    const width = stage.clientWidth || 320;
    if (width === state.size) return;
    state.size = width;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(width * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uScale, canvas.width / (2 * VIEW_EXTENT));
    requestFrame();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      state.visible = entries[0]?.isIntersecting ?? true;
      if (state.visible) requestFrame();
    },
    { threshold: 0.05 }
  );
  visibilityObserver.observe(stage);
  applyFinish();
  requestFrame();
  return {
    setMood(mood) {
      state.mood = mood;
      applyMood();
    },
    setFinish(finish) {
      state.finish = finish;
      applyFinish();
    },
    setMotion(enabled) {
      state.motion = enabled;
      mouse.active = false;
      if (!enabled) {
        state.assembling = false;
        state.pulseAmount = 0;
        state.glow = 0;
        velocity.fill(0);
        position.set(home);
      }
      requestFrame();
    },
    destroy() {
      if (state.frame) cancelAnimationFrame(state.frame);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("webglcontextlost", onWebglContextLost);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (!lost && !gl.isContextLost()) {
        for (const buffer of buffers) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        if (vertex) gl.deleteShader(vertex);
        if (fragment) gl.deleteShader(fragment);
      }
    }
  };
}
function getReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function subscribe(callback) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function useReducedMotion() {
  return reactExports.useSyncExternalStore(subscribe, getReducedMotion, () => false);
}
function HeroParticleLogo(props) {
  const stageRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const sceneRef = reactExports.useRef(null);
  const reducedMotion = useReducedMotion();
  const finish = props.finish ?? "navy";
  const settingsRef = reactExports.useRef({ finish, mood: props.mood, motion: !reducedMotion });
  settingsRef.current = { finish, mood: props.mood, motion: !reducedMotion };
  reactExports.useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    let scene = null;
    const teardown = () => {
      scene?.destroy();
      scene = null;
      sceneRef.current = null;
    };
    const build = () => {
      try {
        scene = createParticleScene(canvas, stage, () => {
          teardown();
          stage.classList.add("guard-hero-stage--fallback");
        });
      } catch {
        scene = null;
      }
      if (!scene) {
        stage.classList.add("guard-hero-stage--fallback");
        return;
      }
      stage.classList.remove("guard-hero-stage--fallback");
      const settings = settingsRef.current;
      scene.setFinish(settings.finish);
      scene.setMood(settings.mood);
      scene.setMotion(settings.motion);
      sceneRef.current = scene;
    };
    const onContextRestored = () => {
      teardown();
      build();
    };
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    build();
    return () => {
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      teardown();
    };
  }, []);
  reactExports.useEffect(() => {
    sceneRef.current?.setFinish(finish);
  }, [finish]);
  reactExports.useEffect(() => {
    sceneRef.current?.setMood(props.mood);
  }, [props.mood]);
  reactExports.useEffect(() => {
    sceneRef.current?.setMotion(!reducedMotion);
  }, [reducedMotion]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: stageRef, className: `guard-hero-stage${props.className ? ` ${props.className}` : ""}`, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-hero-halo" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "guard-hero-canvas" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-hero-fallback", dangerouslySetInnerHTML: { __html: brandMarkSvg(finish === "white" ? "#ffffff" : BRAND_NAVY) } })
  ] });
}
function redactQueueArtifactName(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 48) return null;
  if (/[\\/~:]/.test(trimmed)) return null;
  return trimmed;
}
function describeQueueItem(item) {
  const actionType = item.action_envelope_json?.action_type;
  const name = redactQueueArtifactName(item.artifact_name);
  const suffix = name ? ` · ${name}` : "";
  switch (actionType) {
    case "shell_command":
      return "wants to run a command";
    case "prompt":
      return "sent a prompt that needs a look";
    case "file_read":
      return "wants to read a file";
    case "file_write":
      return "wants to change a file";
    case "mcp_tool":
      return `wants to use a tool${suffix}`;
    case "package_script":
      return `wants to run a package script${suffix}`;
    case "network_request":
      return "wants to reach the internet";
    case "config_change":
      return "wants to change a setting";
    case "browser_action":
      return "wants to act in the browser";
    case "harness_start":
      return "is starting up";
  }
  switch (item.artifact_type) {
    case "file_read_request":
      return "wants to read a file";
    case "prompt_request":
      return "sent a prompt that needs a look";
    case "tool_action_request":
      return `wants to use a tool${suffix}`;
    case "mcp_server":
      return `wants to start a new tool${suffix}`;
    case "extension":
      return `wants to load an extension${suffix}`;
    case "hook":
      return `wants to run a hook${suffix}`;
    default:
      return `wants to run something new${suffix}`;
  }
}
function buildHeroQueuePreview(items, limit = 3) {
  return items.slice(0, limit).map((item) => ({
    requestId: item.request_id,
    app: harnessDisplayName(item.harness),
    what: describeQueueItem(item),
    when: formatRelativeTime(item.created_at)
  }));
}
function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function countReceiptsToday(receipts) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  return receipts.filter((receipt) => new Date(receipt.timestamp) >= today).length;
}
function buildHeroFacts(input) {
  if (input.status === "setup_gap") {
    return ["Runs on this computer only", "Nothing leaves your machine unless you turn on sync", "Free and open source"];
  }
  if (input.status === "checking") {
    return [];
  }
  const facts = [];
  const appsLabel = `${formatNumber(input.watchedAppsCount)} app${input.watchedAppsCount === 1 ? "" : "s"}`;
  const fullyProtected = input.status === "clear" || input.status === "needs_review";
  facts.push(fullyProtected ? `${appsLabel} protected` : `${appsLabel} connected`);
  if (input.status === "needs_review") {
    if (input.oldestQueuedAt) facts.push(`Paused ${formatRelativeTime(input.oldestQueuedAt)}`);
    facts.push("Your apps keep working while you decide");
    return facts;
  }
  const todayKey = localDateKey(/* @__PURE__ */ new Date());
  const todayFromAnalytics = input.analytics?.daily_activity.find((day) => day.date_key === todayKey)?.total;
  const checkedToday = todayFromAnalytics ?? countReceiptsToday(input.latestReceipts);
  if (checkedToday > 0) facts.push(`${formatNumber(checkedToday)} action${checkedToday === 1 ? "" : "s"} checked today`);
  const latest = input.latestReceipts[0];
  if (latest) facts.push(`Last decision ${formatRelativeTime(latest.timestamp)}`);
  return facts;
}
function buildHeroLiveLabel(status, watchedAppsCount, queuedCount) {
  if (status === "needs_review") return queuedCount === 1 ? "1 paused" : `${queuedCount} paused`;
  if (status === "setup_gap") return "Ready";
  if (status === "checking") return "Checking";
  if (status === "degraded") return "Needs repair";
  if (status === "partial") return "Partly protected";
  return `Watching ${watchedAppsCount} app${watchedAppsCount === 1 ? "" : "s"}`;
}
function oldestCreatedAt(items) {
  let oldest = null;
  let oldestMs = Number.POSITIVE_INFINITY;
  for (const item of items) {
    const ms = Date.parse(item.created_at);
    if (Number.isFinite(ms) && ms < oldestMs) {
      oldestMs = ms;
      oldest = item.created_at;
    }
  }
  return oldest;
}
function buildHomeHeroModel(input) {
  const oldest = input.queuedItems.length >= input.queuedCount ? oldestCreatedAt(input.queuedItems) : null;
  return {
    facts: buildHeroFacts({
      status: input.status,
      watchedAppsCount: input.watchedAppsCount,
      latestReceipts: input.latestReceipts,
      analytics: input.analytics,
      oldestQueuedAt: oldest
    }),
    liveLabel: buildHeroLiveLabel(input.status, input.watchedAppsCount, input.queuedCount),
    queue: buildHeroQueuePreview(input.queuedItems)
  };
}
const HERO_BADGE_LABELS = {
  clear: "Protected",
  needs_review: "Needs your choice",
  setup_gap: "Setup needed",
  partial: "Partially protected",
  degraded: "Degraded",
  checking: "Checking"
};
function heroToneForStatus(status) {
  if (status === "needs_review" || status === "degraded") return "review";
  if (status === "clear") return "clear";
  return "setup";
}
function HeroStatusBadge(props) {
  const tone = heroToneForStatus(props.status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `guard-hero-badge guard-hero-badge--${tone}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("i", { "aria-hidden": "true" }),
    HERO_BADGE_LABELS[props.status]
  ] });
}
function heroMoodForStatus(status) {
  return heroToneForStatus(status);
}
function HomeHero(props) {
  const dataStatus = heroToneForStatus(props.status);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      className: "guard-hero guard-surface-in relative overflow-hidden rounded-2xl border border-white/10 p-5 text-white sm:p-6 lg:p-8",
      "data-status": dataStatus,
      role: "region",
      "aria-label": "Protection status",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-0 space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "guard-hero-label flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Protection status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(HeroStatusBadge, { status: props.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "guard-hero-title text-3xl font-semibold tracking-tight text-white sm:text-4xl", children: props.headline }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-xl text-[15px] leading-relaxed text-white/75", children: props.subheadline })
          ] }),
          props.queue.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "rounded-xl border border-white/15 bg-white/[0.08] p-1", "aria-label": "Actions waiting for review", children: props.queue.map((item) => {
            const content = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-2 w-2 shrink-0 rounded-full bg-[#ffd58a]", "aria-hidden": "true" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "min-w-0 flex-1 truncate text-sm text-white", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: item.app }),
                " ",
                item.what
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-white/65", children: item.when })
            ] });
            const onOpenRequest = props.onOpenRequest;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: onOpenRequest ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => onOpenRequest(item.requestId),
                className: "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                children: [
                  content,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniChevronRight, { className: "h-4 w-4 shrink-0 text-white/50", "aria-hidden": "true" })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full items-center gap-3 rounded-lg px-3 py-2", children: content }) }, item.requestId);
          }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "guard-hero-ctas flex flex-wrap gap-3", children: [
            props.cta,
            props.secondaryCta
          ] }),
          props.facts.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm text-white/75", children: props.facts.map((fact) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "guard-hero-fact", children: fact }, fact)) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-full max-w-[380px] lg:max-w-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeroParticleLogo, { mood: heroMoodForStatus(props.status), finish: "white" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "guard-hero-live", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("i", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: props.liveLabel })
          ] })
        ] })
      ] })
    }
  );
}
const SAMPLE_ACTIONS = [
  {
    id: "install-package",
    harness: "claude-code",
    appName: "Claude Code",
    glyph: "CC",
    action: "Wants to install a package",
    target: "left-pad@9.9.9",
    noun: "package",
    reason: "New package. It has never been installed on this computer.",
    question: "Claude Code wants to install left-pad@9.9.9. It’s new here."
  },
  {
    id: "read-secrets",
    harness: "codex",
    appName: "Codex",
    glyph: "Cx",
    action: "Wants to read a file",
    target: ".env",
    noun: "file",
    reason: "This file holds secrets. Guard always asks before an app reads it.",
    question: "Codex wants to read .env, which holds your secrets."
  },
  {
    id: "add-tool",
    harness: "cursor",
    appName: "Cursor",
    glyph: "Cu",
    action: "Wants to add a tool",
    target: "weather-tools",
    noun: "tool",
    reason: "New tool from a publisher Guard hasn’t seen on this computer.",
    question: "Cursor wants to add a new tool called weather-tools."
  }
];
const SAMPLE_PHASE_DELAYS_MS = {
  checking: 1150,
  paused: 1050
};
const INITIAL_SAMPLE_STATE = { phase: "idle", sampleIndex: 0, decision: null, runs: 0 };
function sampleReducer(state, event) {
  switch (event.type) {
    case "run":
      if (state.phase !== "idle" && state.phase !== "decided") return state;
      return { phase: "requested", sampleIndex: state.phase === "decided" ? state.sampleIndex + 1 : state.sampleIndex, decision: null, runs: state.runs + 1 };
    case "advance":
      if (state.phase === "requested") return { ...state, phase: "checking" };
      if (state.phase === "checking") return { ...state, phase: "paused" };
      return state;
    case "decide":
      if (state.phase !== "paused") return state;
      return { ...state, phase: "decided", decision: event.decision };
    case "reset":
      return { ...INITIAL_SAMPLE_STATE, sampleIndex: state.sampleIndex, runs: state.runs };
    default:
      return state;
  }
}
function currentSample(state, samples = SAMPLE_ACTIONS) {
  return samples[state.sampleIndex % samples.length];
}
function personalizeSamples(connectedHarnesses, samples = SAMPLE_ACTIONS) {
  const connected = new Set(connectedHarnesses.map((harness) => normalizeHarnessSlug(harness)).filter((slug) => slug !== null));
  if (connected.size === 0) return samples;
  const spare = Array.from(connected).filter((slug) => !samples.some((sample) => sample.harness === slug));
  return samples.map((sample) => {
    if (connected.has(sample.harness)) return sample;
    const replacement = spare.shift();
    if (!replacement) return sample;
    const appName = harnessDisplayName(replacement);
    return {
      ...sample,
      harness: replacement,
      appName,
      glyph: appName.slice(0, 2),
      question: sample.question.replace(sample.appName, appName)
    };
  });
}
function sampleStepForPhase(phase) {
  if (phase === "requested" || phase === "checking") return 1;
  if (phase === "paused") return 2;
  if (phase === "decided") return 3;
  return 0;
}
function buildSampleCopy(sample, state) {
  const { phase, decision } = state;
  if (phase === "idle") {
    return {
      appNote: "Working normally. Run the sample to see what happens when it tries something new.",
      guardStatus: "Watching",
      guardDetail: "Nothing new right now.",
      guardTag: null,
      youTitle: "Nothing to decide",
      youBody: "Guard only asks when it can’t tell an action is safe.",
      receiptLine: null,
      receiptNote: null
    };
  }
  if (phase === "requested") {
    return {
      appNote: "The app pauses here and waits for an answer.",
      guardStatus: "Watching",
      guardDetail: "Something new is on its way.",
      guardTag: null,
      youTitle: "Nothing to decide",
      youBody: "Guard only asks when it can’t tell an action is safe.",
      receiptLine: null,
      receiptNote: null
    };
  }
  if (phase === "checking") {
    return {
      appNote: "The app pauses here and waits for an answer.",
      guardStatus: "Checking…",
      guardDetail: "Comparing against what this computer has seen before.",
      guardTag: null,
      youTitle: "Nothing to decide",
      youBody: "Guard only asks when it can’t tell an action is safe.",
      receiptLine: null,
      receiptNote: null
    };
  }
  if (phase === "paused") {
    return {
      appNote: "The app pauses here and waits for an answer.",
      guardStatus: "Paused",
      guardDetail: sample.reason,
      guardTag: { tone: "attention", label: "Stopped before it ran" },
      youTitle: "Your call",
      youBody: sample.question,
      receiptLine: null,
      receiptNote: null
    };
  }
  const verb = decision === "block" ? "blocked" : "allowed";
  const receiptLine = `${sample.appName} ${verb} ${sample.target}${decision === "once" ? " (once)" : ""}`;
  return {
    appNote: decision === "block" ? "The app was told no and moved on." : "The app got its answer and continued.",
    guardStatus: "Decision saved",
    guardDetail: "Back to watching.",
    guardTag: decision === "block" ? { tone: "default", label: "Blocked" } : { tone: "success", label: "Allowed" },
    youTitle: decision === "block" ? "Blocked" : decision === "once" ? "Allowed once" : "Always allowed",
    youBody: decision === "block" ? "The app gets a clear “no” and keeps running. Nothing was installed or read." : decision === "once" ? "The app continues. Guard will ask again next time, because you chose once." : `The app continues, and Guard won’t ask about this exact ${sample.noun} again on this computer. If it changes, Guard checks it again.`,
    receiptLine,
    receiptNote: "In real use this is saved on this computer as a receipt you can look back at in Evidence." + (decision === "always" ? " Remembered decisions can be cleared from Home at any time." : "")
  };
}
const HOW_GUARD_WORKS_STEPS = [
  {
    title: "Guard watches",
    body: "It sits in front of AI apps like Claude Code, Codex, and Cursor, and sees what they’re about to do on this computer.",
    icon: HiMiniEye
  },
  {
    title: "Guard sorts each action",
    body: "Routine work runs and clearly harmful actions are stopped. Anything Guard can’t vouch for, like an unknown package or a file with secrets, waits for you.",
    icon: HiMiniHandRaised
  },
  {
    title: "You decide, Guard remembers",
    body: "Allow once, always allow, or block. Every decision is saved as a receipt. Always allow covers that exact action; if it changes, Guard checks it again.",
    icon: HiMiniDocumentCheck
  }
];
const COLLAPSE_STORAGE_KEY = "guard-collapsed-how-guard-works";
function resolveHowGuardWorksDefaultOpen(receiptCount) {
  return receiptCount < 20;
}
function readStoredOpen() {
  try {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(COLLAPSE_STORAGE_KEY) : null;
    return stored === null ? null : stored === "1";
  } catch {
    return null;
  }
}
function writeStoredOpen(open) {
  try {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, open ? "1" : "0");
  } catch {
    return;
  }
}
function useHowGuardWorksReveal() {
  const [openSignal, setOpenSignal] = reactExports.useState(0);
  const reducedMotion = useReducedMotion();
  const reveal = reactExports.useCallback(() => {
    setOpenSignal((value) => value + 1);
    window.setTimeout(() => {
      document.getElementById("guard-how-it-works")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }, 0);
  }, [reducedMotion]);
  return { openSignal, reveal };
}
function HomeHowGuardWorks(props) {
  const [open, setOpen] = reactExports.useState(() => readStoredOpen() ?? resolveHowGuardWorksDefaultOpen(props.receiptCount));
  reactExports.useEffect(() => {
    if (props.openSignal) {
      setOpen(true);
      writeStoredOpen(true);
    }
  }, [props.openSignal]);
  const toggle = reactExports.useCallback(() => {
    setOpen((previous) => {
      writeStoredOpen(!previous);
      return !previous;
    });
  }, []);
  const reducedMotion = useReducedMotion();
  const samples = reactExports.useMemo(() => personalizeSamples(props.connectedHarnesses), [props.connectedHarnesses]);
  const [state, dispatch] = reactExports.useReducer(sampleReducer, INITIAL_SAMPLE_STATE);
  const sample = currentSample(state, samples);
  const copy = buildSampleCopy(sample, state);
  const litStep = sampleStepForPhase(state.phase);
  reactExports.useEffect(() => {
    if (state.phase !== "requested" && state.phase !== "checking") return;
    const delay = reducedMotion ? 0 : state.phase === "requested" ? SAMPLE_PHASE_DELAYS_MS.checking : SAMPLE_PHASE_DELAYS_MS.paused;
    const timer = window.setTimeout(() => dispatch({ type: "advance" }), delay);
    return () => window.clearTimeout(timer);
  }, [state.phase, reducedMotion]);
  const handleRun = reactExports.useCallback(() => dispatch({ type: "run" }), []);
  const handleDecide = reactExports.useCallback((decision) => dispatch({ type: "decide", decision }), []);
  const running = state.phase === "requested" || state.phase === "checking" || state.phase === "paused";
  const markState = state.phase === "decided" ? state.decision === "block" ? "blocked" : "allowed" : state.phase;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "guard-how-it-works", className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm", "aria-label": "How Guard protects you", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: toggle, className: "flex min-w-0 flex-1 items-start gap-3 text-left", "aria-expanded": open, "aria-controls": "guard-how-it-works-body", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "How Guard protects you" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Guard sits between your AI apps and this computer. Three things happen, every time." })
        ] }),
        open ? /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniChevronUp, { className: "mt-1 h-4 w-4 shrink-0 text-muted-foreground", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniChevronDown, { className: "mt-1 h-4 w-4 shrink-0 text-muted-foreground", "aria-hidden": "true" })
      ] }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { onClick: handleRun, disabled: running, className: "w-full shrink-0 sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniPlay, { className: "mr-2 h-4 w-4", "aria-hidden": "true" }),
        state.phase === "decided" ? "Run another sample" : "Run a sample action"
      ] }) : null
    ] }),
    open ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "guard-how-it-works-body", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-3", children: HOW_GUARD_WORKS_STEPS.map((step, index) => {
        const Icon = step.icon;
        const number = index + 1;
        const lit = litStep === number;
        const done = litStep > number;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `guard-how-step bg-white px-5 py-4${lit ? " guard-how-step--lit" : ""}${done ? " guard-how-step--done" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "guard-how-step-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4", "aria-hidden": "true" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-brand-dark", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1.5 font-mono text-[11px] text-slate-400", children: number }),
              step.title
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2.5 text-sm leading-relaxed text-slate-500", children: step.body })
        ] }, step.title);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 bg-surface-1/60 px-5 py-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-dark", children: "Watch a sample action go through Guard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "This is a demonstration. Nothing runs on your computer." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)_auto_minmax(0,1fr)] sm:items-stretch", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `guard-sample-card rounded-xl border border-slate-200 bg-white p-4${litStep === 1 ? " guard-sample-card--active" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400", children: "AI app" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono text-[11px] font-bold text-brand-dark", children: sample.glyph }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-dark", children: sample.appName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `guard-sample-chip mt-3 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.05] px-3 py-2${state.phase === "idle" ? " guard-sample-chip--hidden" : ""}`, "aria-hidden": state.phase === "idle", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-brand-dark", children: sample.action }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate font-mono text-[11px] text-brand-dark/70", children: sample.target })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-slate-500", children: copy.appNote })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `guard-sample-link${state.phase === "requested" ? " guard-sample-link--sending" : ""}`, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "guard-sample-dot" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `guard-sample-card rounded-xl border border-slate-200 bg-white p-4${litStep === 2 || state.phase === "checking" ? " guard-sample-card--active" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400", children: "Guard" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-sample-mark h-12 w-12 shrink-0", "data-state": markState, dangerouslySetInnerHTML: { __html: brandMarkSvg("#3f4174") } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-dark", children: copy.guardStatus }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs leading-relaxed text-slate-500", children: copy.guardDetail })
              ] })
            ] }),
            copy.guardTag ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { tone: copy.guardTag.tone, children: copy.guardTag.label }) }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `guard-sample-link${state.phase === "paused" ? " guard-sample-link--sending" : ""}`, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "guard-sample-dot" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `guard-sample-card rounded-xl border border-slate-200 bg-white p-4${litStep === 3 || state.phase === "paused" ? " guard-sample-card--active" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400", children: "You" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-dark", children: copy.youTitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs leading-relaxed text-slate-500", children: copy.youBody }),
              state.phase === "paused" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SampleDecisionButton, { label: "Allow once", decision: "once", variant: "primary", onDecide: handleDecide }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SampleDecisionButton, { label: "Always allow", decision: "always", variant: "outline", onDecide: handleDecide }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SampleDecisionButton, { label: "Block", decision: "block", variant: "danger", onDecide: handleDecide })
              ] }) : null
            ] })
          ] })
        ] }),
        copy.receiptLine ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "guard-fade-in mt-3 flex flex-col gap-2 rounded-xl border border-brand-green/25 bg-brand-green/[0.05] px-4 py-3 sm:flex-row sm:items-start sm:gap-3", role: "status", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniDocumentCheck, { className: "mt-0.5 h-4 w-4 shrink-0 text-brand-green-text", "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-brand-dark", children: [
              "Sample receipt: ",
              copy.receiptLine
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-slate-600", children: copy.receiptNote })
          ] })
        ] }) : null
      ] })
    ] }) : null
  ] });
}
function SampleDecisionButton(props) {
  const handleClick = reactExports.useCallback(() => props.onDecide(props.decision), [props.onDecide, props.decision]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { variant: props.variant, onClick: handleClick, children: props.label });
}
function resolveSetupApps(managedInstalls, observedHarnesses) {
  const apps = /* @__PURE__ */ new Map();
  for (const install of managedInstalls) {
    if (!isConnectableAppHarness(install.harness) || install.active) continue;
    apps.set(install.harness, { harness: install.harness, name: harnessDisplayName(install.harness), state: "partial" });
  }
  for (const harness of observedHarnesses) {
    if (!isConnectableAppHarness(harness) || apps.has(harness)) continue;
    apps.set(harness, { harness, name: harnessDisplayName(harness), state: "found" });
  }
  return Array.from(apps.values()).sort((a, b) => a.name.localeCompare(b.name));
}
function buildSetupAppsCopy(apps) {
  if (apps.length === 0) {
    return "Guard hasn’t seen an AI app on this computer yet. Open one and run it once; Guard will notice it and show it here.";
  }
  return "Guard found these on this computer. Connecting takes a few seconds and doesn’t change how the app works.";
}
function HomeSetupCard(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "guard-fade-in rounded-2xl border border-brand-blue/15 bg-white shadow-sm", "aria-label": "Get set up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-slate-100 px-5 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Get set up" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Three steps. Guard only changes something after you approve it." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "divide-y divide-slate-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-4 px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green-bg text-brand-green-text", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniCheckCircle, { className: "h-4 w-4", "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-dark", children: "Install Guard on this computer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-slate-500", children: "Done. Guard is running and this dashboard is live." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { tone: "green", children: "Done" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white", children: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-dark", children: "Connect an AI app" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-slate-500", children: buildSetupAppsCopy(props.apps) }),
          props.apps.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid gap-2 sm:grid-cols-2", role: "list", "aria-label": "Apps found on this computer", children: props.apps.map((app) => /* @__PURE__ */ jsxRuntimeExports.jsx(SetupAppRow, { app, onConnectHarness: props.onConnectHarness }, app.harness)) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-slate-500", children: SUPPORTED_APPS_FULL })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-4 px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500", children: "3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-brand-dark", children: "Keep working" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-sm text-slate-500", children: "Guard stays quiet until an app tries something new. Then it pauses and asks you here." })
        ] })
      ] })
    ] })
  ] });
}
function SetupAppRow(props) {
  const handleConnect = reactExports.useCallback(() => props.onConnectHarness(props.app.harness), [props.onConnectHarness, props.app.harness]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "listitem", className: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono text-[11px] font-bold text-brand-dark", "aria-hidden": "true", children: props.app.name.slice(0, 2) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium text-brand-dark", children: props.app.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: props.app.state === "partial" ? "Setup not finished" : "Found on this computer" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: handleConnect, children: props.app.state === "partial" ? "Finish setup" : "Connect" })
  ] });
}
function WhatStaysLocalCard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-brand-purple/15 bg-brand-purple/[0.04] p-5 shadow-sm sm:p-6", "aria-label": ABOUT_LOCAL_SECTION_TITLE, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-brand-purple", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniLockClosed, { className: "h-5 w-5", "aria-hidden": "true" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: ABOUT_LOCAL_SECTION_TITLE }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: ABOUT_LOCAL_SECTION_BODY })
    ] })
  ] }) });
}
function HomeInsightsSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-4", children: Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 bg-white px-4 py-3.5 sm:py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton h-3 w-16 rounded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton h-6 w-20 rounded" })
    ] }, index)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 px-5 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton mb-3 h-3 w-28 rounded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-2", children: Array.from({ length: 5 }, (_, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton h-5 w-full max-w-5 rounded-[3px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton h-2.5 w-7 rounded" })
      ] }, index)) })
    ] })
  ] });
}
function EvidenceInsightsHomePreview({
  overviewStats,
  analytics,
  analyticsLoading = false,
  onOpenInsights,
  onShare
}) {
  const insightsAvailable = analytics !== null && analytics.total > 0;
  const showInsightsSection = analyticsLoading || insightsAvailable;
  const showInsightsFooter = Boolean(onOpenInsights) && (analyticsLoading || insightsAvailable);
  const miniHeatmapDays = analytics?.daily_activity?.slice(-5).map((day) => ({
    date: day.date_key,
    level: getHeatmapLevel(day.total, analytics?.peak_day_total || 1)
  })) ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Your Guard stats" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "What needs you now, plus patterns from recorded actions on this machine." })
      ] }),
      onShare && insightsAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(EvidenceInsightsShareButton, { onClick: onShare, className: "shrink-0" }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-px bg-slate-100", children: overviewStats.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      GuardStatMetric,
      {
        label: item.label,
        value: item.value,
        tone: item.tone,
        compact: true,
        animationDelayMs: index * 40
      },
      item.label
    )) }),
    showInsightsSection ? analyticsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(HomeInsightsSkeleton, {}) : analytics !== null && analytics.total > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HomeInsightsMetrics, { analytics }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-100 px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Last 5 days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EvidenceActivityHeatmapMini, { cells: miniHeatmapDays }) })
      ] })
    ] }) : null : null,
    showInsightsFooter ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-100 px-5 py-4", children: insightsAvailable && onOpenInsights ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onOpenInsights,
        className: "text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:ring-offset-2",
        children: "See all insights →"
      }
    ) : analyticsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton h-4 w-36 rounded" }) : null }) : null
  ] });
}
const client = createCommandActivityClient(fetchCommandActivityApi);
function HomeCommandActivityCard(props) {
  const [analytics, setAnalytics] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const controller = new AbortController();
    client.fetchAnalytics({ days: 90, top_limit: 10, dimension: null, dimension_value: null }, controller.signal).then(
      (data) => setAnalytics(data),
      () => void 0
    );
    return () => controller.abort();
  }, []);
  const handleOpen = reactExports.useCallback(() => props.onOpen(), [props.onOpen]);
  const model = analytics === null ? null : homeCommandActivityModel(analytics);
  if (model === null) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-slate-200 bg-white p-4 shadow-sm", "aria-labelledby": "home-command-activity-title", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/[0.08] text-brand-blue", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniCommandLine, { className: "h-5 w-5", "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "home-command-activity-title", className: "text-sm font-semibold text-brand-dark", children: "Commands checked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: model.window })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleOpen, "aria-label": "Open command activity", className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-dark", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniChevronRight, { className: "h-5 w-5", "aria-hidden": "true" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-brand-dark", children: model.metrics.commandsChecked.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Checked" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-brand-dark", children: model.metrics.prompted.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Review prompts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold text-brand-dark", children: model.metrics.postProof.toLocaleString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Post proof" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-3 text-xs ${model.health ? "text-amber-700" : "text-slate-500"}`, children: model.health ?? "Evidence store reporting normally." })
  ] });
}
function buildDaemonErrorCopy() {
  return {
    title: "Guard is not responding",
    body: "The local Guard service is not reachable. Retry the connection, or open Settings if you need to repair protection.",
    primaryCta: "Retry",
    secondaryCta: "Go to Settings"
  };
}
function buildHomeRuntimeErrorCopy(message) {
  if (queueErrorIsUnauthorizedSession(message)) {
    return {
      kind: "session",
      title: "This window needs a signed session",
      body: "Guard is still running on this device. Reconnect this window so the dashboard and local protection stay in sync.",
      primaryCta: "Reconnect",
      secondaryCta: "Open review queue"
    };
  }
  return { kind: "daemon", ...buildDaemonErrorCopy() };
}
const safeLocalStorage = {
  getItem(key) {
    try {
      return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
      }
    } catch {
      return;
    }
  }
};
const STREAK_MILESTONE_MESSAGES = {
  7: "One week of Guard activity on this machine.",
  14: "Two weeks of consistent Guard coverage.",
  30: "A full month of daily Guard coverage."
};
function resolveCloudUpsellVisible(pendingCount, cloudState) {
  if (pendingCount > 0) return false;
  return cloudState === "local_only";
}
function buildEmptyStateCopy() {
  return {
    title: "No apps connected",
    body: "Connect an AI app so Guard can start protecting it. Guard works with Codex, Claude Code, Cursor, Grok, Hermes, Kimi, Devin, and more.",
    installHint: "hol-guard apps connect <app>"
  };
}
function redactHomeArtifactLabel(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "a local action";
  }
  const trimmed = value.trim();
  if (trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("~") || trimmed.includes(":") || trimmed.length > 48) {
    return "a local action";
  }
  return trimmed;
}
function buildRecentProtectionCopy(receipt) {
  const harness = harnessDisplayName(receipt.harness);
  const label = redactHomeArtifactLabel(receipt.artifact_name);
  if (approvalLeftActionStopped(receipt)) {
    return `${harness} stayed stopped on ${label} after a one-time approval`;
  }
  return guardActionActivityCopy(receipt.policy_decision, harness, label);
}
function HomeWorkspace(props) {
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const [clearPassword, setClearPassword] = reactExports.useState("");
  const [clearTotpCode, setClearTotpCode] = reactExports.useState("");
  const [clearError, setClearError] = reactExports.useState(null);
  const [clearSubmitting, setClearSubmitting] = reactExports.useState(false);
  const [shareOpen, setShareOpen] = reactExports.useState(false);
  const handleShareOpen = reactExports.useCallback(() => {
    setShareOpen(true);
  }, []);
  const handleShareClose = reactExports.useCallback(() => {
    setShareOpen(false);
  }, []);
  const toastTimerRef = reactExports.useRef(null);
  const analyticsEnabled = props.runtime.kind === "ready" && (props.runtime.snapshot?.receipt_count ?? 0) > 0;
  const analyticsState = useReceiptAnalytics(analyticsEnabled);
  reactExports.useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);
  const showToast = reactExports.useCallback((message) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3e3);
  }, []);
  const handleClearPolicies = reactExports.useCallback((scope) => {
    props.onClearPolicies(scope);
  }, [props.onClearPolicies]);
  const handleTurnProtectionOn = reactExports.useCallback(() => {
    const current = props.runtime.kind === "ready" ? props.runtime.snapshot : null;
    void updateSettings(current === null ? { protection_posture: "protected" } : turnProtectionOnUpdate(current)).then(async () => {
      await props.onRefreshRuntime?.();
      props.onOpenSettings();
    }).catch((error) => {
      const message = error instanceof Error ? error.message : "Unable to turn protection on.";
      showToast(message);
      props.onOpenSettings();
    });
  }, [props.onOpenSettings, props.onRefreshRuntime, props.runtime, showToast]);
  const handleClearPasswordChange = reactExports.useCallback((event) => {
    setClearPassword(event.target.value);
    setClearError(null);
  }, []);
  const handleClearTotpCodeChange = reactExports.useCallback((event) => {
    setClearTotpCode(event.target.value);
    setClearError(null);
  }, []);
  const handleConfirmClearWithToast = reactExports.useCallback(async () => {
    const confirm = props.clearConfirm;
    setClearSubmitting(true);
    setClearError(null);
    try {
      await props.onConfirmClear({
        ...clearPassword ? { approval_password: clearPassword } : {},
        ...clearTotpCode ? { approval_totp_code: clearTotpCode } : {}
      });
      setClearPassword("");
      setClearTotpCode("");
      if (confirm?.harness) {
        showToast(`Cleared for ${harnessDisplayName(confirm.harness)}`);
      } else if (confirm?.all) {
        showToast("Cleared all decisions");
      }
    } catch (error) {
      setClearError(error instanceof Error ? error.message : "Unable to clear remembered decisions.");
    } finally {
      setClearSubmitting(false);
    }
  }, [clearPassword, clearTotpCode, props.clearConfirm, props.onConfirmClear, showToast]);
  const snapshot = props.runtime.kind === "ready" ? props.runtime.snapshot : null;
  const queuedCount = resolveHomeQueuedCount({
    pendingCount: snapshot?.pending_count ?? null,
    requestCount: props.requests.kind === "ready" ? props.requests.items.length : null
  });
  const policyItems = props.policies.kind === "ready" ? props.policies.items : [];
  const managedInstalls = (snapshot?.managed_installs ?? []).filter((item) => isConnectableAppHarness(item.harness));
  const activeInstalls = managedInstalls.filter((item) => item.active);
  const observedHarnesses = snapshot ? Array.from(
    new Set([
      ...snapshot.items.map((item) => item.harness),
      ...snapshot.latest_receipts.map((receipt) => receipt.harness),
      ...policyItems.map((policy) => policy.harness)
    ].filter(isConnectableAppHarness))
  ).sort() : [];
  const clearHarnesses = activeInstalls.length > 0 ? activeInstalls.map((i) => i.harness) : observedHarnesses;
  const watchedAppsCount = activeInstalls.length > 0 ? activeInstalls.length : observedHarnesses.length;
  const protectionState = useProtectionPresentationState(
    snapshot ? protectionHealthFor(snapshot) : unavailableProtectionHealth()
  );
  const state = reactExports.useMemo(
    () => deriveHomeState({
      hasActiveInstalls: activeInstalls.length > 0,
      hasObservedHarnesses: observedHarnesses.length > 0,
      queuedCount,
      watchedAppsCount,
      protectionState
    }),
    [activeInstalls.length, observedHarnesses.length, protectionState, queuedCount, watchedAppsCount]
  );
  const dailyStory = reactExports.useMemo(
    () => snapshot ? buildDailyStory(snapshot.latest_receipts, queuedCount) : null,
    [snapshot, queuedCount]
  );
  const streak = reactExports.useMemo(() => {
    if (analyticsState.kind === "ready") {
      return analyticsState.data.active_day_streak;
    }
    return snapshot ? computeStreak(snapshot.latest_receipts) : 0;
  }, [analyticsState, snapshot]);
  const cloudUpsellVisible = reactExports.useMemo(
    () => snapshot ? resolveCloudUpsellVisible(queuedCount, snapshot.cloud_state) : false,
    [snapshot, queuedCount]
  );
  const queuedItems = props.requests.kind === "ready" ? props.requests.items : [];
  const heroModel = buildHomeHeroModel({
    status: state.heroStatus,
    watchedAppsCount,
    queuedCount,
    queuedItems,
    latestReceipts: snapshot?.latest_receipts ?? [],
    analytics: analyticsState.kind === "ready" ? analyticsState.data : null
  });
  const howGuardWorks = useHowGuardWorksReveal();
  const ctaAction = state.ctaTarget === "inbox" ? props.onOpenInbox : state.ctaTarget === "protect" ? props.onOpenFleet : props.onOpenEvidence;
  if (props.runtime.kind === "loading" || props.requests.kind === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton h-36 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-skeleton h-16 w-full" })
    ] });
  }
  if (props.runtime.kind === "error") {
    const errorCopy = buildHomeRuntimeErrorCopy(props.runtime.message);
    const handlePrimary = () => {
      if (errorCopy.kind === "session") {
        void props.onReconnectSession?.();
        return;
      }
      void props.onRefreshRuntime?.();
    };
    const handleSecondary = errorCopy.kind === "session" ? props.onOpenInbox : props.onOpenSettings;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        title: errorCopy.title,
        body: errorCopy.body,
        action: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: handlePrimary, children: errorCopy.primaryCta }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { variant: "outline", onClick: handleSecondary, children: errorCopy.secondaryCta })
        ] }),
        tone: "teach"
      }
    );
  }
  if (!snapshot) return null;
  const watchBanner = watchBannerModel(snapshot);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    watchBanner !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx(WatchProtectionBanner, { model: watchBanner, onTurnProtectionOn: handleTurnProtectionOn }) : null,
    shareOpen && analyticsState.kind === "ready" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EvidenceInsightsShareModal,
      {
        analytics: analyticsState.data,
        runtime: snapshot,
        onClose: handleShareClose
      }
    ) : null,
    toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "guard-fade-in fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-brand-green/25 bg-brand-green-bg/90 px-4 py-3 shadow-lg backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniCheckCircle, { className: "h-4 w-4 shrink-0 text-brand-green", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-brand-green-text", children: toastMessage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HomeHero,
      {
        status: state.heroStatus,
        headline: state.headline,
        subheadline: state.subheadline,
        facts: heroModel.facts,
        liveLabel: heroModel.liveLabel,
        queue: heroModel.queue,
        cta: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { onClick: ctaAction, "data-primary": "true", children: state.ctaLabel }),
        secondaryCta: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { variant: "outline", onClick: howGuardWorks.reveal, children: state.heroStatus === "setup_gap" ? "See how it works" : "How Guard works" }),
        onOpenRequest: props.onOpenRequest
      }
    ),
    state.heroStatus === "setup_gap" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      HomeSetupCard,
      {
        apps: resolveSetupApps(managedInstalls, observedHarnesses),
        onConnectHarness: props.onConnectHarness ?? props.onOpenAppDetail
      }
    ) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HomeHowGuardWorks,
      {
        receiptCount: snapshot.receipt_count ?? 0,
        connectedHarnesses: activeInstalls.map((item) => item.harness),
        openSignal: howGuardWorks.openSignal
      }
    ),
    snapshot.operator_health ? /* @__PURE__ */ jsxRuntimeExports.jsx(OperatorHealthCard, { health: snapshot.operator_health }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EvidenceInsightsHomePreview,
      {
        overviewStats: [
          { label: "Pending", value: formatNumber(queuedCount), tone: queuedCount > 0 ? "blue" : "slate" },
          { label: "Apps", value: formatNumber(watchedAppsCount), tone: watchedAppsCount > 0 ? "green" : "slate" },
          { label: "Recorded", value: formatNumber(snapshot.receipt_count ?? 0), tone: "slate" }
        ],
        analytics: analyticsState.kind === "ready" ? analyticsState.data : null,
        analyticsLoading: analyticsState.kind === "loading" && analyticsEnabled,
        runtime: snapshot,
        onOpenInsights: props.onOpenInsights,
        onShare: handleShareOpen
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HomeCommandActivityCard, { onOpen: props.onOpenCommands }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StreakMilestoneBanner, { streak }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NewAppDiscoveryBanner,
      {
        managedInstalls,
        observedHarnesses,
        receipts: snapshot.latest_receipts,
        policies: policyItems,
        onOpenAppDetail: props.onOpenAppDetail
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-6", children: [
        state.heroStatus !== "setup_gap" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          AppsAtAGlance,
          {
            managedInstalls,
            observedHarnesses,
            queuedItems,
            onOpenAppDetail: props.onOpenAppDetail
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          HomeProtectionModule,
          {
            snapshot,
            managedInstalls,
            onOpenFleet: props.onOpenFleet,
            onOpenSupplyChain: props.onOpenSupplyChain
          }
        ),
        dailyStory && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          CollapsibleCard,
          {
            id: "daily-brief",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniShieldCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-brand-green", "aria-hidden": "true" }),
            label: dailyStory.title,
            defaultOpen: true,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: dailyStory.body }),
              dailyStory.stats && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: dailyStory.stats.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-brand-dark",
                  children: [
                    s.value,
                    " ",
                    s.label
                  ]
                },
                s.label
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { className: "mt-4", variant: "secondary", onClick: props.onOpenTodayEvidence, children: "Review today's activity" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-6", children: [
        state.heroStatus === "setup_gap" && /* @__PURE__ */ jsxRuntimeExports.jsx(WhatStaysLocalCard, {}),
        snapshot.latest_receipts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(RecentProtectionSection, { receipts: snapshot.latest_receipts }),
        policyItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-slate-100 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Reset remembered decisions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Clear remembered decisions when you want Guard to ask again next time. This does not remove your history." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: clearHarnesses.slice(0, 4).map((harness) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ClearHarnessButton,
            {
              harness,
              onClearPolicies: handleClearPolicies
            },
            harness
          )) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceProofCard, { device: snapshot.device, proofStatus: snapshot.proof_status }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CloudStatusCard,
        {
          snapshot,
          showUpsell: cloudUpsellVisible,
          onOpenSettings: props.onOpenSettings
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyboardHelpCard, { onOpenHelp: props.onOpenHelp })
    ] }),
    props.clearConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClearConfirmDialog,
      {
        clearConfirm: props.clearConfirm,
        approvalGate: props.approvalGate,
        clearPassword,
        clearTotpCode,
        clearError,
        clearSubmitting,
        onClearPasswordChange: handleClearPasswordChange,
        onClearTotpCodeChange: handleClearTotpCodeChange,
        onCancelClear: props.onCancelClear,
        onConfirmClear: handleConfirmClearWithToast
      }
    )
  ] });
}
function ClearConfirmDialog(props) {
  const dialogRef = reactExports.useRef(null);
  useFocusTrap(true, dialogRef);
  const needsProof = props.approvalGate?.enabled === true && props.approvalGate.configured === true;
  const needsPassword = approvalProofRequiresPassword(props.approvalGate);
  const proofIncomplete = needsProof && (needsPassword ? props.clearPassword.trim() === "" : props.clearTotpCode.trim() === "");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "guard-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm", role: "dialog", "aria-modal": "true", "aria-label": "Confirm clear decisions", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: dialogRef, className: "guard-fade-in w-full max-w-md rounded-2xl border border-brand-attention/20 bg-white p-6 shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniExclamationTriangle, { className: "mt-0.5 h-5 w-5 shrink-0 text-brand-attention", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold tracking-tight text-brand-dark", children: "Clear remembered decisions?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
          "This will remove ",
          props.clearConfirm.all ? "all saved approvals" : `decisions for ${props.clearConfirm.harness ?? "this app"}`,
          ". Guard will ask again next time matching actions run."
        ] }),
        needsProof && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid gap-3", children: needsPassword ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Approval password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              autoComplete: "current-password",
              value: props.clearPassword,
              onChange: props.onClearPasswordChange,
              className: "mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-brand-dark focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Authenticator code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 6,
              value: props.clearTotpCode,
              onChange: props.onClearTotpCodeChange,
              placeholder: "123456",
              autoComplete: "one-time-code",
              className: "mt-1 min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm tracking-[0.28em] text-brand-dark focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            }
          )
        ] }) }),
        props.clearError !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 rounded-xl border border-brand-attention/20 bg-brand-attention/[0.04] px-3 py-2 text-sm text-brand-dark", children: props.clearError })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: props.onCancelClear,
          className: "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-brand-dark transition-colors hover:bg-slate-50",
          children: "Keep decisions"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: props.onConfirmClear,
          disabled: props.clearSubmitting || proofIncomplete,
          className: "inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-attention px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-attention/90 disabled:opacity-60",
          children: props.clearSubmitting ? "Clearing..." : "Clear decisions"
        }
      )
    ] })
  ] }) });
}
function resolveHomeQueuedCount(input) {
  return Math.max(input.pendingCount ?? 0, input.requestCount ?? 0);
}
function deriveHomeState(input) {
  const { hasActiveInstalls, hasObservedHarnesses, protectionState, queuedCount, watchedAppsCount } = input;
  if (queuedCount > 0) {
    return {
      heroStatus: "needs_review",
      headline: queuedCount === 1 ? "1 action needs review" : `${queuedCount} actions need review`,
      subheadline: "Guard paused an action for your decision. Review it, then choose whether to allow or block it.",
      ctaLabel: "Review now",
      ctaTarget: "inbox"
    };
  }
  if (!hasActiveInstalls && !hasObservedHarnesses) {
    return {
      heroStatus: "setup_gap",
      headline: "Welcome to Guard",
      subheadline: "Guard sits between your AI apps and this computer. Routine work runs, harmful actions are stopped, and Guard asks you when it can’t tell.",
      ctaLabel: "See setup steps",
      ctaTarget: "protect"
    };
  }
  if (!hasActiveInstalls && hasObservedHarnesses) {
    return {
      heroStatus: "setup_gap",
      headline: "Finish setup",
      subheadline: "Guard found apps on this computer, but they need setup before they are fully protected.",
      ctaLabel: "Finish setup",
      ctaTarget: "protect"
    };
  }
  if (protectionState === "checking") {
    return {
      heroStatus: "checking",
      headline: "Checking protection",
      subheadline: "Guard is confirming local protection. This takes a moment.",
      ctaLabel: "Open Protect",
      ctaTarget: "protect"
    };
  }
  if (protectionState === "degraded") {
    return {
      heroStatus: "degraded",
      headline: "Protection is degraded",
      subheadline: "Guard is running, but one or more required protection checks failed or remain unproven.",
      ctaLabel: "Review protection",
      ctaTarget: "protect"
    };
  }
  if (protectionState === "partial") {
    return {
      heroStatus: "partial",
      headline: "Protection is partial",
      subheadline: "Core protection passes, but complete decision-stream evidence is not available.",
      ctaLabel: "Review protection",
      ctaTarget: "protect"
    };
  }
  return {
    heroStatus: "clear",
    headline: "All clear",
    subheadline: `Guard is watching your AI work. ${watchedAppsCount} app${watchedAppsCount !== 1 ? "s" : ""} protected. Nothing needs you right now.`,
    ctaLabel: "View history",
    ctaTarget: "evidence"
  };
}
function buildDailyStory(receipts, queuedCount) {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayReceipts = receipts.filter((r) => new Date(r.timestamp) >= today);
  const allowedToday = todayReceipts.filter((r) => guardActionDisposition(r.policy_decision) === "allowed").length;
  const blockedToday = todayReceipts.filter((r) => guardActionDisposition(r.policy_decision) === "blocked").length;
  const reviewedToday = todayReceipts.filter((r) => guardActionDisposition(r.policy_decision) === "reviewed").length;
  if (queuedCount > 0) {
    const actionText = queuedCount === 1 ? "1 action is" : `${queuedCount} actions are`;
    const pronoun = queuedCount === 1 ? "it" : "them";
    return {
      title: "Needs your attention",
      body: `${actionText} waiting for review. Guard paused ${pronoun} to keep you safe.`,
      stats: [{ label: "pending review", value: queuedCount }]
    };
  }
  if (allowedToday + blockedToday + reviewedToday > 0) {
    const clauses = [];
    if (allowedToday > 0) clauses.push(`allowed ${allowedToday} action${allowedToday !== 1 ? "s" : ""}`);
    if (blockedToday > 0) clauses.push(`blocked ${blockedToday}`);
    if (reviewedToday > 0) clauses.push(`sent ${reviewedToday} for review`);
    const story = clauses.length > 1 ? `${clauses.slice(0, -1).join(", ")} and ${clauses[clauses.length - 1]}` : clauses[0];
    return {
      title: "Today so far",
      body: `Guard ${story}.`,
      stats: [
        ...allowedToday > 0 ? [{ label: "allowed", value: allowedToday }] : [],
        ...blockedToday > 0 ? [{ label: "blocked", value: blockedToday }] : [],
        ...reviewedToday > 0 ? [{ label: "review", value: reviewedToday }] : []
      ]
    };
  }
  if (receipts.length > 0) {
    const last = receipts[0];
    return {
      title: "All quiet",
      body: `No new activity today. Last decision was ${formatRelativeTime(last.timestamp)}.`
    };
  }
  return null;
}
function harnessPriorityScore(install, observed, pendingCount) {
  let score = 0;
  if (install?.active) {
    score = 3;
  } else if (install !== void 0) {
    score = 2;
  } else if (observed) {
    score = 1;
  }
  if (pendingCount > 0) score += 4;
  return score;
}
function computeStreak(receipts) {
  if (receipts.length === 0) return 0;
  const sortedByTime = [...receipts].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const mostRecent = new Date(sortedByTime[0].timestamp);
  const now = /* @__PURE__ */ new Date();
  const diffHours = (now.getTime() - mostRecent.getTime()) / (1e3 * 60 * 60);
  if (diffHours > 48) return 0;
  const dates = new Set(receipts.map((r) => new Date(r.timestamp).toDateString()));
  const sortedDates = Array.from(dates).sort((a, b) => +new Date(b) - +new Date(a));
  let streak = 0;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  let checkDate = new Date(today);
  for (const dateStr of sortedDates) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (d.getTime() < checkDate.getTime()) {
      break;
    }
  }
  return streak;
}
function AppsAtAGlance(props) {
  const pendingByHarness = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const item of props.queuedItems) {
      map.set(item.harness, (map.get(item.harness) ?? 0) + 1);
    }
    return map;
  }, [props.queuedItems]);
  const sortedHarnesses = reactExports.useMemo(() => {
    const all = Array.from(
      /* @__PURE__ */ new Set([
        ...props.managedInstalls.map((i) => i.harness),
        ...props.observedHarnesses
      ])
    );
    return all.sort((a, b) => {
      const aInstall = props.managedInstalls.find((i) => i.harness === a);
      const bInstall = props.managedInstalls.find((i) => i.harness === b);
      const aPending = pendingByHarness.get(a) ?? 0;
      const bPending = pendingByHarness.get(b) ?? 0;
      const aScore = harnessPriorityScore(aInstall, props.observedHarnesses.includes(a), aPending);
      const bScore = harnessPriorityScore(bInstall, props.observedHarnesses.includes(b), bPending);
      return bScore - aScore;
    });
  }, [props.managedInstalls, props.observedHarnesses, pendingByHarness]);
  if (sortedHarnesses.length === 0) {
    const emptyCopy = buildEmptyStateCopy();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        title: emptyCopy.title,
        body: emptyCopy.body,
        tone: "teach"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Apps at a glance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-slate-500", children: "Guard is watching these apps on this machine." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-slate-100 border-t border-slate-100", role: "list", "aria-label": "Apps at a glance", children: sortedHarnesses.map((harness, index) => {
      const install = props.managedInstalls.find((i) => i.harness === harness);
      const isObserved = props.observedHarnesses.includes(harness);
      const pending = pendingByHarness.get(harness) ?? 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        AppGlanceRow,
        {
          harness,
          install,
          isObserved,
          pending,
          onOpenAppDetail: props.onOpenAppDetail
        },
        harness
      );
    }) })
  ] });
}
function AppGlanceRow(props) {
  const handleOpen = reactExports.useCallback(() => {
    props.onOpenAppDetail(props.harness);
  }, [props.onOpenAppDetail, props.harness]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "listitem", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      "data-app-item": true,
      onClick: handleOpen,
      className: "flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-slate-50/60 focus:bg-brand-blue/[0.04] focus:outline-none focus:ring-2 focus:ring-brand-blue/30",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AppStatusIcon, { install: props.install, isObserved: props.isObserved }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium text-brand-dark", children: harnessDisplayName(props.harness) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          props.pending > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { tone: "info", children: [
            props.pending,
            " pending"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AppStatusBadge, { install: props.install, isObserved: props.isObserved }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniChevronRight, { className: "h-4 w-4 shrink-0 text-slate-300", "aria-hidden": "true" })
        ] })
      ]
    }
  ) });
}
function AppStatusIcon(props) {
  if (props.install?.active === true) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniCheckCircle, { className: "h-4 w-4 shrink-0 text-brand-green", "aria-hidden": "true" });
  }
  if (props.install !== void 0 && !props.install.active) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniMinusCircle, { className: "h-4 w-4 shrink-0 text-brand-attention", "aria-hidden": "true" });
  }
  if (props.isObserved) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniMinusCircle, { className: "h-4 w-4 shrink-0 text-slate-400", "aria-hidden": "true" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniMinusCircle, { className: "h-4 w-4 shrink-0 text-slate-300", "aria-hidden": "true" });
}
function AppStatusBadge(props) {
  if (props.install?.active === true) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { tone: "success", children: "Active" });
  }
  if (props.install !== void 0 && !props.install.active) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { tone: "attention", children: "Needs setup" });
  }
  if (props.isObserved) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { tone: "attention", children: "Needs setup" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { tone: "attention", children: "Needs setup" });
}
function ClearHarnessButton(props) {
  const handleClick = reactExports.useCallback(() => {
    void props.onClearPolicies({ harness: props.harness });
  }, [props.onClearPolicies, props.harness]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionButton, { variant: "outline", onClick: handleClick, children: [
    "Clear ",
    props.harness
  ] });
}
function CloudStatusCard(props) {
  const copy = resolveCloudIntelCopy(props.snapshot.cloud_state);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-brand-blue/15 bg-brand-blue/[0.04] p-5 shadow-sm sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-brand-blue", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniCloud, { className: "h-5 w-5", "aria-hidden": "true" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Cloud sync" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium text-brand-dark", children: copy.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: copy.detail }),
      props.showUpsell && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { variant: "outline", onClick: props.onOpenSettings, children: "Open sync settings" }) })
    ] })
  ] }) });
}
function KeyboardHelpCard(props) {
  if (!props.onOpenHelp) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm sm:p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-brand-dark", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniQuestionMarkCircle, { className: "h-5 w-5", "aria-hidden": "true" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Shortcuts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Press ? for help or / to jump to pending review. Every Home action also works with Tab and Enter." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { variant: "ghost", onClick: props.onOpenHelp, children: "Show shortcuts" }) })
    ] })
  ] }) });
}
function RecentReceiptRow(props) {
  const { receipt } = props;
  const copy = buildRecentProtectionCopy(receipt);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 border-b border-slate-200/70 px-4 py-3 last:border-b-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-brand-dark", children: copy }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-[11px] text-muted-foreground", children: formatRelativeTime(receipt.timestamp) })
  ] });
}
function RecentProtectionSection(props) {
  const recent = props.receipts.slice(0, 3);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Recent protection" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "What Guard stopped or allowed recently." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200/70", children: recent.map((receipt) => /* @__PURE__ */ jsxRuntimeExports.jsx(RecentReceiptRow, { receipt }, receipt.receipt_id)) })
  ] });
}
const MILESTONE_STREAKS = [7, 14, 30];
function StreakMilestoneBanner({ streak }) {
  const milestone = MILESTONE_STREAKS.includes(streak) ? streak : null;
  const storageKey = milestone ? `guard-streak-milestone-dismissed-${milestone}` : "";
  const [dismissed, setDismissed] = reactExports.useState(() => {
    if (!storageKey) return true;
    return safeLocalStorage.getItem(storageKey) === "1";
  });
  const handleDismiss = reactExports.useCallback(() => {
    setDismissed(true);
    if (storageKey) safeLocalStorage.setItem(storageKey, "1");
  }, [storageKey]);
  if (!milestone || dismissed) return null;
  const messages = STREAK_MILESTONE_MESSAGES;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "guard-fade-in relative overflow-hidden rounded-2xl border border-brand-purple/20 bg-brand-purple/[0.04] p-5 shadow-sm sm:p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-purple/10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-purple/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniSparkles, { className: "h-5 w-5 text-brand-purple", "aria-hidden": "true" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionLabel, { children: [
          streak,
          " day coverage"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: messages[milestone] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleDismiss,
          className: "shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/70 hover:text-brand-dark",
          "aria-label": "Dismiss streak celebration",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniXMark, { className: "h-4 w-4", "aria-hidden": "true" })
        }
      )
    ] })
  ] });
}
function NewAppDiscoveryBanner(props) {
  const discovered = resolveNewAppDiscoveries(props.managedInstalls, props.observedHarnesses);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: discovered.map((harness) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    NewAppBanner,
    {
      harness,
      onOpenAppDetail: props.onOpenAppDetail
    },
    harness
  )) });
}
function resolveNewAppDiscoveries(managedInstalls, observedHarnesses) {
  const activeHarnesses = new Set(managedInstalls.filter((i) => isConnectableAppHarness(i.harness)).map((i) => i.harness));
  return observedHarnesses.filter((h) => isConnectableAppHarness(h) && !activeHarnesses.has(h));
}
function NewAppBanner(props) {
  const storageKey = `guard-new-app-dismissed-${props.harness}`;
  const [dismissed, setDismissed] = reactExports.useState(() => {
    return safeLocalStorage.getItem(storageKey) === "1";
  });
  const handleDismiss = reactExports.useCallback((e) => {
    e.stopPropagation();
    setDismissed(true);
    safeLocalStorage.setItem(storageKey, "1");
  }, [storageKey]);
  const handleOpen = reactExports.useCallback(() => {
    props.onOpenAppDetail(props.harness);
  }, [props.onOpenAppDetail, props.harness]);
  if (dismissed) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "guard-fade-in flex w-full items-center gap-3 rounded-xl border border-brand-blue/15 bg-brand-blue/[0.04] px-4 py-3 text-left transition-colors hover:bg-brand-blue/[0.08]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniBolt, { className: "h-4 w-4 text-brand-blue", "aria-hidden": "true" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-brand-dark", children: [
        "Guard discovered ",
        harnessDisplayName(props.harness)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Guard saw this app but it is not set up yet. Open to connect it." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: handleOpen,
        className: "inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-brand-blue transition-colors hover:bg-white/70",
        children: "Open"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: handleDismiss,
        className: "shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/70 hover:text-brand-dark",
        "aria-label": `Dismiss ${harnessDisplayName(props.harness)} discovery`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniXMark, { className: "h-4 w-4", "aria-hidden": "true" })
      }
    )
  ] });
}
function CollapsibleCard(props) {
  const storageKey = `guard-collapsed-${props.id}`;
  const [isOpen, setIsOpen] = reactExports.useState(() => {
    const saved = safeLocalStorage.getItem(storageKey);
    return saved === null ? props.defaultOpen ?? true : saved === "1";
  });
  const toggle = reactExports.useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      safeLocalStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  }, [storageKey]);
  const borderClass = props.id === "daily-brief" ? "border-brand-green/15 bg-brand-green/[0.04]" : "border-brand-purple/15 bg-brand-purple/[0.04]";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border ${borderClass} p-5 shadow-sm sm:p-6`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: toggle,
        className: "flex w-full items-center gap-3 text-left",
        "aria-expanded": isOpen,
        "aria-controls": `collapsible-content-${props.id}`,
        children: [
          props.icon,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: props.label }) }),
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniChevronUp, { className: "h-4 w-4 shrink-0 text-muted-foreground", "aria-hidden": "true" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(HiMiniChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground", "aria-hidden": "true" })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: `collapsible-content-${props.id}`, className: "mt-3 guard-fade-in", children: props.children })
  ] });
}
export {
  HomeWorkspace,
  STREAK_MILESTONE_MESSAGES,
  buildDaemonErrorCopy,
  buildDailyStory,
  buildEmptyStateCopy,
  buildHomeRuntimeErrorCopy,
  buildRecentProtectionCopy,
  computeStreak,
  deriveHomeState,
  redactHomeArtifactLabel,
  resolveCloudUpsellVisible,
  resolveHomeQueuedCount,
  resolveNewAppDiscoveries,
  safeLocalStorage
};
