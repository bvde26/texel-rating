# Catamaran Scroll-Explode Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een scroll-gestuurde 3D exploded-view intro van een grijze Nacra 15 catamaran die bij het eerste bezoek 1× afspeelt en daarna naar Home gaat.

**Architecture:** Een framework-agnostische Three.js-module (`catamaranScene.js`) bouwt een procedurele catamaran uit ~15 losse meshes en interpoleert ze tussen een assembled transform en een Fibonacci-sphere-verdeling op basis van progress 0→1. Een React-hook (`useScrollProgress`) zet wheel/touch-delta om naar geclampte progress. `CatamaranIntro.jsx` koppelt beide en regelt hold+fade. `App.jsx` rendert de intro conditioneel vóór de bestaande app-shell op basis van een localStorage-flag en `prefers-reduced-motion`.

**Tech Stack:** React 19, Vite, Three.js, anime.js (alleen voor de fade-out tween + skip-affordance), localStorage.

**Spec:** `docs/superpowers/specs/2026-05-15-catamaran-scroll-explode-design.md`

---

## Notes voor de uitvoerder

- Het project heeft **geen testrunner** (geen vitest/jest) en dat blijft zo — geen testdependency toevoegen (conventie: geen onnodige deps). Pure logica wordt geverifieerd met een wegwerp-`node`-assert; de feature zelf wordt visueel geverifieerd met de **superpowers:webapp-testing** skill (Playwright, draait buiten de repo-deps).
- Commits in het Engels, kort (repo-conventie).
- Tailwind is aanwezig maar de intro is full-screen canvas; gebruik inline styles alleen waar dynamisch (canvas/overlay), net als bestaande `App.jsx`.
- Eenheden in de scène ≈ meters; een `THREE.Group` met `scale` past het model in beeld.

## File Structure

- Create: `src/three/catamaranScene.js` — pure Three.js: bouw catamaran, lights, camera, renderer; `update(progress)`, `render()`, `resize()`, `dispose()`. Geen React.
- Create: `src/three/fibonacciSphere.js` — pure helper: `fibonacciSpherePoints(n, radius)`. Apart zodat het zonder DOM te unit-checken is.
- Create: `src/hooks/useScrollProgress.js` — wheel/touch-delta → geclampte progress + `done`.
- Create: `src/pages/CatamaranIntro.jsx` — mount/unmount scène, rAF-loop, hold+fade, skip-chevron, `onDone`.
- Create: `src/intro/introGate.js` — pure helper: `shouldSkipIntro()` + `markIntroSeen()` (localStorage + reduced-motion + `/beheer`).
- Modify: `src/App.jsx` — conditioneel `CatamaranIntro` vóór de shell.

---

### Task 1: Dependencies installeren

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Installeer three en animejs**

Run:
```bash
cd ~/Desktop/texel-rating && npm install three "animejs@^3.2.2"
```
Expected: `three` en `animejs@3.x` toegevoegd aan `dependencies`, geen audit-blokkers.
**Belangrijk:** pin op v3 — de code in Task 6 gebruikt de v3-API
(`import anime from 'animejs'`, `anime({ targets, complete })`). v4 heeft geen
default export en breekt de fade naar Home.

- [ ] **Step 2: Verifieer versies**

Run:
```bash
node -e "console.log(require('three/package.json').version, require('animejs/package.json').version)"
```
Expected: twee versienummers, geen error.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add three and animejs deps"
```

---

### Task 2: Fibonacci-sphere helper (pure, getest)

**Files:**
- Create: `src/three/fibonacciSphere.js`

- [ ] **Step 1: Schrijf de helper**

```javascript
// src/three/fibonacciSphere.js
// Verdeelt n punten gelijkmatig over een bol met gegeven radius.
// Retourneert array van { x, y, z } in wereldcoördinaten rond origin.
export function fibonacciSpherePoints(n, radius) {
  if (n <= 0) return []
  const points = []
  const golden = Math.PI * (3 - Math.sqrt(5)) // ~2.39996
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2 // 1 .. -1
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    points.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius,
    })
  }
  return points
}
```

- [ ] **Step 2: Verifieer met wegwerp-assert**

Run:
```bash
cd ~/Desktop/texel-rating && node --input-type=module -e "
import { fibonacciSpherePoints } from './src/three/fibonacciSphere.js';
const p = fibonacciSpherePoints(15, 2);
console.assert(p.length === 15, 'count');
for (const q of p) {
  const d = Math.hypot(q.x, q.y, q.z);
  console.assert(Math.abs(d - 2) < 1e-6, 'radius ' + d);
}
console.assert(fibonacciSpherePoints(0, 2).length === 0, 'empty');
console.log('OK');
"
```
Expected: `OK`, geen `Assertion failed`.

- [ ] **Step 3: Commit**

```bash
git add src/three/fibonacciSphere.js
git commit -m "feat: fibonacci sphere point helper"
```

---

### Task 3: Intro-gate helper (pure, getest)

**Files:**
- Create: `src/intro/introGate.js`

- [ ] **Step 1: Schrijf de helper**

```javascript
// src/intro/introGate.js
const KEY = 'texelrating:catamaranIntroSeen'

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Intro overslaan als: flag gezet, reduced-motion, of deeplink naar /beheer.
export function shouldSkipIntro() {
  if (typeof window === 'undefined') return true
  if (window.location.pathname === '/beheer') return true
  if (prefersReducedMotion()) return true
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return false // privémodus: intro gewoon tonen
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    /* best-effort: geen blocker */
  }
}
```

- [ ] **Step 2: Verifieer met wegwerp-assert (jsdom-vrij, simuleer window)**

Run:
```bash
cd ~/Desktop/texel-rating && node --input-type=module -e "
global.window = {
  location: { pathname: '/' },
  matchMedia: () => ({ matches: false }),
  localStorage: (() => { let s={}; return { getItem:k=>k in s?s[k]:null, setItem:(k,v)=>{s[k]=String(v)} } })(),
};
const m = await import('./src/intro/introGate.js');
console.assert(m.shouldSkipIntro() === false, 'fresh visit shows intro');
m.markIntroSeen();
console.assert(m.shouldSkipIntro() === true, 'after seen -> skip');
window.location.pathname = '/beheer';
console.assert(m.shouldSkipIntro() === true, 'beheer deeplink skips');
console.log('OK');
"
```
Expected: `OK`, geen `Assertion failed`.

- [ ] **Step 3: Commit**

```bash
git add src/intro/introGate.js
git commit -m "feat: intro gate (localStorage + reduced-motion + /beheer)"
```

---

### Task 4: useScrollProgress hook

**Files:**
- Create: `src/hooks/useScrollProgress.js`

- [ ] **Step 1: Schrijf de hook**

```javascript
// src/hooks/useScrollProgress.js
import { useEffect, useRef, useState } from 'react'

// Geaccumuleerde delta (px) die overeenkomt met progress 0 -> 1. Tunebaar.
export const SCROLL_DISTANCE_PX = 1400

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

// smoothstep easing op de ruwe progress.
function ease(t) {
  return t * t * (3 - 2 * t)
}

// Vangt wheel + verticale touch-drag op het element en mapt naar progress.
// enabled=false => geen capture (reduced-motion pad).
export function useScrollProgress(targetRef, enabled = true) {
  const accRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = targetRef.current
    if (!el || !enabled) return

    let touchY = null

    const apply = (deltaPx) => {
      accRef.current = Math.max(0, Math.min(SCROLL_DISTANCE_PX, accRef.current + deltaPx))
      const p = ease(clamp01(accRef.current / SCROLL_DISTANCE_PX))
      setProgress(p)
      if (p >= 1) setDone(true)
    }

    const onWheel = (e) => {
      e.preventDefault()
      apply(e.deltaY)
    }
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e) => {
      if (touchY == null) return
      const y = e.touches[0]?.clientY ?? touchY
      const dy = touchY - y // omhoog vegen = vooruit
      touchY = y
      e.preventDefault()
      apply(dy)
    }
    const onTouchEnd = () => {
      touchY = null
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [targetRef, enabled])

  return { progress, done }
}
```

- [ ] **Step 2: Lint-check**

Run:
```bash
cd ~/Desktop/texel-rating && npx eslint src/hooks/useScrollProgress.js
```
Expected: geen errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useScrollProgress.js
git commit -m "feat: useScrollProgress wheel/touch -> clamped progress"
```

---

### Task 5: catamaranScene — geometrie & opbouw

**Files:**
- Create: `src/three/catamaranScene.js`

- [ ] **Step 1: Schrijf de scène-module**

> Alle onderdelen krijgen `userData.home = { pos: Vector3, quat: Quaternion }` (assembled). De exploded targets komen uit `fibonacciSpherePoints`. `update(p)` lerpt per part `home -> sphere` met factor `p` plus een eigen spin; de hele groep draait traag voor de cinematic turn.

```javascript
// src/three/catamaranScene.js
import * as THREE from 'three'
import { fibonacciSpherePoints } from './fibonacciSphere.js'

const GREY = 0x9aa0a6
const GREY_SAIL = 0xb9bdc2

function mat(color) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.62 })
}

// Bouwt de catamaran. Retourneert { group, parts } met parts = Mesh[].
function buildCatamaran() {
  const group = new THREE.Group()
  const parts = []
  const bodyMat = mat(GREY)
  const sailMat = mat(GREY_SAIL)
  sailMat.side = THREE.DoubleSide

  const add = (geo, m, pos, rot = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, m)
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    group.add(mesh)
    parts.push(mesh)
    return mesh
  }

  // --- Rompen (slank, capsule langs X, dun in Y/Z) ---
  const hullGeo = new THREE.CapsuleGeometry(0.22, 4.0, 6, 14)
  for (const z of [-1.0, 1.0]) {
    const hull = add(hullGeo, bodyMat, [0, 0, z], [0, 0, Math.PI / 2])
    hull.scale.set(1, 1, 0.7) // iets afgeplat
  }

  // --- Dwarsbalken (voor/achter) ---
  const beamGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.3, 12)
  add(beamGeo, bodyMat, [1.1, 0.12, 0], [Math.PI / 2, 0, 0])  // voorbalk
  add(beamGeo, bodyMat, [-1.0, 0.12, 0], [Math.PI / 2, 0, 0]) // achterbalk

  // --- Trampoline-dek ---
  add(new THREE.BoxGeometry(2.0, 0.03, 1.7), bodyMat, [0.05, 0.13, 0])

  // --- Mast (hoog, lichte buiging via segmenten) ---
  const mast = add(new THREE.CylinderGeometry(0.06, 0.085, 7.4, 12), bodyMat, [0.9, 3.85, 0], [0, 0, -0.04])
  mast.name = 'mast'

  // --- Giek ---
  add(new THREE.CylinderGeometry(0.045, 0.045, 2.6, 10), bodyMat, [-0.35, 0.55, 0], [0, 0, Math.PI / 2])

  // --- Square-top grootzeil (driehoek met brede platte top) ---
  {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(2.5, 0.2)
    s.lineTo(0.55, 6.7)  // schuine top
    s.lineTo(-0.15, 6.95) // brede square-top
    s.lineTo(0, 0)
    const geo = new THREE.ShapeGeometry(s)
    add(geo, sailMat, [0.85, 0.55, 0.01], [0, -Math.PI / 2, 0])
  }

  // --- Fok (kleiner, voorin) ---
  {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(1.5, 0.1)
    s.lineTo(0.1, 3.6)
    s.lineTo(0, 0)
    const geo = new THREE.ShapeGeometry(s)
    add(geo, sailMat, [2.1, 0.5, 0], [0, -Math.PI / 2, 0])
  }

  // --- Roeren (achter, in elke romp) ---
  const rudderGeo = new THREE.BoxGeometry(0.06, 0.7, 0.28)
  for (const z of [-1.0, 1.0]) add(rudderGeo, bodyMat, [-2.05, -0.42, z], [0, 0, 0.15])

  // --- Helmstok-verbinding ---
  add(new THREE.CylinderGeometry(0.025, 0.025, 2.1, 8), bodyMat, [-1.8, 0.15, 0], [Math.PI / 2, 0, 0])

  // --- Zwaarden (daggerboards) ---
  const dbGeo = new THREE.BoxGeometry(0.05, 0.9, 0.22)
  for (const z of [-1.0, 1.0]) add(dbGeo, bodyMat, [0.2, -0.55, z], [0, 0, 0.05])

  // Centreer de groep op zijn bounding-center.
  const box = new THREE.Box3().setFromObject(group)
  const center = box.getCenter(new THREE.Vector3())
  group.children.forEach((c) => c.position.sub(center))

  // Sla assembled transform op en bereken sphere-targets.
  const radius = box.getSize(new THREE.Vector3()).length() * 0.55
  const targets = fibonacciSpherePoints(parts.length, radius)
  parts.forEach((mesh, i) => {
    mesh.userData.homePos = mesh.position.clone()
    mesh.userData.homeQuat = mesh.quaternion.clone()
    mesh.userData.target = new THREE.Vector3(targets[i].x, targets[i].y, targets[i].z)
    // willekeurige maar deterministische spin-as per part
    mesh.userData.spin = new THREE.Vector3(
      Math.sin(i * 1.3), Math.cos(i * 0.7), Math.sin(i * 2.1),
    ).normalize()
  })

  return { group, parts }
}

export function createCatamaranScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe9eaec) // strakke studio-achtergrond

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(7.5, 2.6, 9.5)
  camera.lookAt(0, 0.4, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9a9a, 0.85))
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(6, 9, 7)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.45)
  rim.position.set(-7, 3, -6)
  scene.add(rim)

  const { group, parts } = buildCatamaran()
  scene.add(group)

  const _v = new THREE.Vector3()
  const _q = new THREE.Quaternion()

  function update(progress) {
    const p = Math.max(0, Math.min(1, progress))
    for (const mesh of parts) {
      _v.copy(mesh.userData.homePos).lerp(mesh.userData.target, p)
      mesh.position.copy(_v)
      _q.setFromAxisAngle(mesh.userData.spin, p * Math.PI * 1.2)
      mesh.quaternion.copy(mesh.userData.homeQuat).multiply(_q)
    }
  }

  let raf = 0
  let clock = new THREE.Clock()
  function loop() {
    raf = requestAnimationFrame(loop)
    group.rotation.y += clock.getDelta() * 0.18 // trage cinematic turn
    renderer.render(scene, camera)
  }

  function start() {
    if (!raf) { clock = new THREE.Clock(); loop() }
  }

  function resize() {
    const w = container.clientWidth || 1
    const h = container.clientHeight || 1
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  function dispose() {
    cancelAnimationFrame(raf)
    raf = 0
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) o.material.dispose()
    })
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }

  resize()
  update(0)
  return { update, start, resize, dispose, _parts: parts }
}
```

- [ ] **Step 2: Lint-check**

Run:
```bash
cd ~/Desktop/texel-rating && npx eslint src/three/catamaranScene.js src/three/fibonacciSphere.js
```
Expected: geen errors.

- [ ] **Step 3: Commit**

```bash
git add src/three/catamaranScene.js
git commit -m "feat: procedural Nacra 15 three.js scene + explode update"
```

---

### Task 6: CatamaranIntro component

**Files:**
- Create: `src/pages/CatamaranIntro.jsx`

- [ ] **Step 1: Schrijf het component**

```jsx
// src/pages/CatamaranIntro.jsx
import { useEffect, useRef } from 'react'
import anime from 'animejs'
import { createCatamaranScene } from '../three/catamaranScene.js'
import { useScrollProgress } from '../hooks/useScrollProgress.js'

export default function CatamaranIntro({ onDone }) {
  const wrapRef = useRef(null)
  const canvasHostRef = useRef(null)
  const sceneRef = useRef(null)
  const finishedRef = useRef(false)
  const { progress, done } = useScrollProgress(wrapRef, true)

  // Scene-lifecycle
  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return
    const scene = createCatamaranScene(host)
    sceneRef.current = scene
    scene.start()
    const onResize = () => scene.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  // Progress -> scène
  useEffect(() => {
    sceneRef.current?.update(progress)
  }, [progress])

  // Voltooiing: hold + fade -> onDone
  useEffect(() => {
    if (!done || finishedRef.current) return
    finishedRef.current = true
    const holdMs = 600
    const timer = setTimeout(() => {
      anime({
        targets: wrapRef.current,
        opacity: [1, 0],
        duration: 650,
        easing: 'easeInOutQuad',
        complete: onDone,
      })
    }, holdMs)
    return () => clearTimeout(timer)
  }, [done, onDone])

  const skip = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    anime({
      targets: wrapRef.current,
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInOutQuad',
      complete: onDone,
    })
  }

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', inset: 0, background: '#e9eaec',
        touchAction: 'none', overflow: 'hidden', zIndex: 50,
      }}
    >
      <div ref={canvasHostRef} style={{ position: 'absolute', inset: 0 }} />
      <button
        onClick={skip}
        aria-label="Skip intro"
        style={{
          position: 'absolute', bottom: 22, left: '50%',
          transform: 'translateX(-50%)', background: 'transparent',
          border: 'none', cursor: 'pointer', padding: 12, opacity: 0.55,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke="#3a3f44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Lint-check**

Run:
```bash
cd ~/Desktop/texel-rating && npx eslint src/pages/CatamaranIntro.jsx
```
Expected: geen errors. `animejs` is in Task 1 op v3 gepind, dus `import anime from 'animejs'` + `anime({ targets, complete })` klopt. Verifieer zo nodig: `node -e "console.log(require('animejs/package.json').version)"` → moet `3.x` zijn.

- [ ] **Step 3: Commit**

```bash
git add src/pages/CatamaranIntro.jsx
git commit -m "feat: CatamaranIntro scene mount + hold/fade + skip"
```

---

### Task 7: Integratie in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Voeg imports toe (bij de andere lazy-imports, regel ~3-12)**

```jsx
import { lazy, Suspense, useEffect, useState } from 'react'
// ... bestaande imports ...
import { shouldSkipIntro, markIntroSeen } from './intro/introGate.js'
const CatamaranIntro = lazy(() => import('./pages/CatamaranIntro'))
```
(Voeg alleen toe wat ontbreekt; `lazy/Suspense/useEffect/useState` bestaan al — niet dupliceren.)

- [ ] **Step 2: State + finish-callback in `App()` (na de bestaande `useState`-regels, vóór `const t = COPY[lang]`)**

```jsx
const [introDone, setIntroDone] = useState(() => shouldSkipIntro())
const finishIntro = () => {
  markIntroSeen()
  setIntroDone(true)
}
```

- [ ] **Step 3: Render de intro conditioneel (direct ná `const isHome = page === 'home'`, vóór de bestaande `return (`)**

```jsx
if (!introDone) {
  return (
    <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#e9eaec' }} />}>
      <CatamaranIntro onDone={finishIntro} />
    </Suspense>
  )
}
```

- [ ] **Step 4: Lint + build**

Run:
```bash
cd ~/Desktop/texel-rating && npx eslint src/App.jsx && npm run build
```
Expected: lint schoon, `vite build` slaagt zonder errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: gate app behind first-visit catamaran intro"
```

---

### Task 8: Visuele verificatie (superpowers:webapp-testing)

**Files:** geen codewijziging; verificatie + screenshots.

REQUIRED SUB-SKILL: gebruik @superpowers:webapp-testing voor deze taak (Playwright buiten repo-deps).

- [ ] **Step 1: Start dev server**

Run:
```bash
cd ~/Desktop/texel-rating && npm run dev
```
Expected: Vite op `http://localhost:5173`.

- [ ] **Step 2: Smoke — eerste bezoek**

Met de webapp-testing skill: open `http://localhost:5173` met **gewiste localStorage**. Verifieer:
- een `<canvas>` is aanwezig binnen ~2s, geen console-errors;
- dispatch wheel-events (`deltaY: 200`) ~8× op de wrapper; maak screenshots bij geschatte progress **0**, **~0.5**, **~1**;
- na voldoende scroll + ~1.3s verschijnt de Home-shell (Suspense weg, geen canvas meer);
- reload de pagina → de intro wordt **overgeslagen**, Home direct zichtbaar.

Expected: 3 screenshots tonen achtereenvolgens: complete catamaran → half geëxplodeerd → onderdelen over een bol verspreid. Geen console-errors.

- [ ] **Step 3: Reduced-motion pad**

Emuleer `prefers-reduced-motion: reduce` met gewiste localStorage, laad de pagina. Verifieer: **geen** canvas/intro, Home direct, geen scroll-capture.

- [ ] **Step 4: Skip-chevron**

Gewiste localStorage, laad, klik de skip-chevron (bottom-center). Verifieer: fade → Home binnen ~0.5s; reload → intro overgeslagen.

- [ ] **Step 5: Leg bewijs vast**

Bewaar de 3 progress-screenshots als bewijs in de afrondingsmelding. Stop de dev server.

- [ ] **Step 6: Commit (alleen als er fixes nodig waren)**

```bash
git add -A && git commit -m "fix: catamaran intro verification fixes"
```

---

## Definition of Done

- [ ] `npm run build` slaagt.
- [ ] Eerste bezoek: scroll explodeert de grijze Nacra 15 over een bol; terugscrollen zet 'm weer in elkaar.
- [ ] Voltooiing/skip/reduced-motion → Home, flag gezet, intro nooit meer.
- [ ] Geen tekst behalve de icon-only skip-chevron.
- [ ] Geen console-errors; `dispose()` ruimt netjes op (geen WebGL-context-lek bij paginawissel).
- [ ] 3 screenshots (progress 0 / 0.5 / 1) vastgelegd.
