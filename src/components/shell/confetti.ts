// Dependency-free DOM confetti (two bursts from the bottom corners), as the command bar's "Celebrate" action.
const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const SHAPES = ['circle', 'square', 'rectangle', 'triangle'] as const;
const MAX_LIVE = 600;

type Particle = { el: HTMLElement; x: number; y: number; vx: number; vy: number; rotation: number; spin: number; born: number; delay: number };

let live: Particle[] = [];
let raf = 0;
let lastTime = 0;

function createParticle(originX: number, originY: number, angleDeg: number, delay: number): Particle {
  const el = document.createElement('div');
  const size = Math.random() * 8 + 4;
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  Object.assign(el.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    pointerEvents: 'none',
    zIndex: '9999',
    transformOrigin: 'center center',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
  } as Partial<CSSStyleDeclaration>);
  if (shape === 'triangle') {
    Object.assign(el.style, {
      width: '0px',
      height: '0px',
      backgroundColor: 'transparent',
      borderLeft: `${size / 2}px solid transparent`,
      borderRight: `${size / 2}px solid transparent`,
      borderBottom: `${size}px solid ${color}`,
    });
  } else {
    const w = shape === 'rectangle' ? Math.random() * 8 + 4 : size;
    const h = shape === 'rectangle' ? Math.random() * 8 + 4 : size;
    Object.assign(el.style, { width: `${w}px`, height: `${h}px`, backgroundColor: color, borderRadius: shape === 'circle' ? '50%' : '2px' });
  }
  const angle = ((angleDeg + (Math.random() - 0.5) * 50) * Math.PI) / 180;
  const speed = Math.random() * 4 + 7;
  return {
    el,
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotation: Math.random() * 360,
    spin: (Math.random() - 0.5) * 5,
    born: performance.now(),
    delay,
  };
}

function step(now: number) {
  const dt = Math.min(2, (now - lastTime) / 16.67 || 1);
  lastTime = now;
  live = live.filter((p) => {
    if (now - p.born < p.delay) return true;
    p.vy += 0.18 * dt; // gravity
    p.vx *= 0.995;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rotation += p.spin * dt;
    const age = now - p.born - p.delay;
    const opacity = age > 2500 ? Math.max(0, 1 - (age - 2500) / 700) : 1;
    p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
    p.el.style.opacity = String(opacity);
    if (opacity <= 0 || p.y > window.innerHeight + 40) {
      p.el.remove();
      return false;
    }
    return true;
  });
  raf = live.length ? requestAnimationFrame(step) : 0;
}

/** Two bursts (bottom-left at -65°, bottom-right at -115°), adaptive count, hard cap of 600 live particles. */
export function fireConfetti() {
  const base = Math.floor(100 * (live.length > 200 ? 0.5 : live.length > 100 ? 0.75 : 1));
  const origins: [number, number, number][] = [
    [0, window.innerHeight, -65],
    [window.innerWidth, window.innerHeight, -115],
  ];
  const batch: Particle[] = [];
  for (const [ox, oy, angle] of origins) {
    for (let i = 0; i < base; i++) batch.push(createParticle(ox, oy, angle, (i / base) * 50));
  }
  for (const p of batch) {
    document.body.appendChild(p.el);
    live.push(p);
    while (live.length > MAX_LIVE) live.shift()?.el.remove();
  }
  if (!raf) {
    lastTime = performance.now();
    raf = requestAnimationFrame(step);
  }
}
