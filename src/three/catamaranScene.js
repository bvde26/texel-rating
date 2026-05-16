// src/three/catamaranScene.js
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { fibonacciSpherePoints } from './fibonacciSphere.js'

// === Kleurpaletten — wissel via localStorage 'texelrating:palette' ===
// (mono | blueprint | studio | regatta | neural). Default = mono.
// spec = [color, emissive, rimScale]. pulse = [kleur, amp, speed, freq, width].
const PALETTES = {
  // Monochroom + slagschaduw: lichtgrijze studio, witte/crème rompen,
  // grijze trampoline, bijna-zwart lijnwerk. Harde radiale puls.
  mono: {
    bg: 0xd6d6da,
    hull: [0x222226, 0x191919, 0.35],   // mast/balken/giek/roer/zwaard
    hull2: [0xf6f3ea, 0xeae6da, 0.22],  // rompen — wit/crème
    deck: [0x7c7c83, 0x66666c, 0.4],    // trampoline — grijs
    sail: [0xbfbfc5, 0xaaaab0, 0.3],
    fit: [0x2c2c30, 0x222223, 0.7],
    wire: [0x18181b, 0x121214, 0.9],
    rim: 0xffffff, rimPow: 3.4,
    opacity: 1.0, sailOpacity: 0.5, metal: 0.15, rough: 0.6, emI: 0.08,
    bloom: 0.0, shadow: true,
    pulse: [0x8fe3ff, 0.62, 0.42, 0.18, 46],
    // Exact de webapp-body-gradient → naadloze fade naar Home.
    bgCss:
      'radial-gradient(1200px 600px at 15% 0%, #E8F1E4 0%, transparent 55%),' +
      'radial-gradient(900px 500px at 95% 100%, #F0E3D4 0%, transparent 50%),' +
      'linear-gradient(180deg, #F6F2E9 0%, #EFEFE8 100%)',
    lights: [0xeeeae0, 0x9a958a, 0.6, 0xfffaf0, 1.05, 0xd8cdbe, 0.4],
  },
  // Technische tekening: koel-witte achtergrond, inkt/marineblauw lijnwerk,
  // staalblauw beslag, geen bloom, opaak.
  blueprint: {
    bg: 0xeef1f5,
    hull: [0x1c2b4a, 0x16243f, 0.5],
    sail: [0x33476b, 0x26385a, 0.32],
    fit: [0x3f5b8c, 0x33507f, 0.8],
    wire: [0x2a3a5e, 0x22314f, 1.0],
    rim: 0x7aa0d8, rimPow: 3.0,
    opacity: 1.0, sailOpacity: 0.42, metal: 0.1, rough: 0.62, emI: 0.16,
    bloom: 0.0,
    lights: [0xdfe6f2, 0x8b97ad, 0.6, 0xffffff, 0.95, 0x9fb7d8, 0.35],
  },
  // Studio: zacht wit, verzadigd indigo/violet, subtiele bloom — premium,
  // dicht bij de oude vibe maar op licht.
  studio: {
    bg: 0xf3f2f8,
    hull: [0x2c2299, 0x231a85, 0.55],
    sail: [0x6f60dd, 0x5747cf, 0.3],
    fit: [0x5142cf, 0x4133bd, 0.85],
    wire: [0x3d2eb0, 0x3122a0, 1.0],
    rim: 0x9486ff, rimPow: 3.0,
    opacity: 1.0, sailOpacity: 0.62, metal: 0.25, rough: 0.42, emI: 0.2,
    bloom: 0.0,
    lights: [0xe9e7f7, 0x9b94c8, 0.62, 0xffffff, 0.95, 0xbcaeff, 0.42],
  },
  // Regatta: warm crème, diep oceaanblauw rompen, gebroken-witte zeilen,
  // signaal-oranje beslag + zeillatten. Texel-zeilsfeer.
  regatta: {
    bg: 0xf9f5ec,
    hull: [0x143b66, 0x0f2e52, 0.5],
    sail: [0xe9e1cf, 0xd8cdb2, 0.3],
    fit: [0xe0552b, 0xc8431d, 0.9],
    wire: [0x2c5a86, 0x21476c, 1.0],
    rim: 0xe08a4a, rimPow: 3.2,
    opacity: 1.0, sailOpacity: 0.5, metal: 0.1, rough: 0.6, emI: 0.18,
    bloom: 0.0,
    lights: [0xf3ead6, 0xae9d7e, 0.65, 0xfff4e0, 0.95, 0x8fb6d8, 0.35],
  },
  // Origineel: neural brain — donker, doorschijnend, sterke bloom.
  neural: {
    bg: 0x05030f,
    hull: [0x2b2170, 0x4b3bd6, 0.9],
    sail: [0x3a2f8c, 0x7d6cff, 0.55],
    fit: [0x6a5cff, 0x8f7dff, 1.25],
    wire: [0x8a7bff, 0xa99bff, 1.6],
    rim: 0x9d8bff, rimPow: 3.2,
    opacity: 0.5, sailOpacity: 0.28, metal: 0.0, rough: 0.55, emI: 0.32,
    bloom: 0.55,
    lights: [0x8a7dff, 0x140a2e, 0.55, 0x9d8bff, 0.6, 0x5ad0ff, 0.4],
  },
}

function activePalette() {
  let key = 'mono'
  try {
    const v = window.localStorage.getItem('texelrating:palette')
    if (v && PALETTES[v]) key = v
  } catch {
    /* default */
  }
  return PALETTES[key]
}

const P = activePalette()
const RIM = new THREE.Color(P.rim)
const PULSE_COL = new THREE.Color(P.pulse ? P.pulse[0] : 0xffffff)

// Shaders die een gedeelde uTime-uniform delen voor de slag-pulse.
// Wordt per scene-build leeggemaakt.
const pulseShaders = []

function addFresnel(material, rimColor, power, scale) {
  const pAmp = P.pulse ? P.pulse[1] : 0
  const pSpeed = P.pulse ? P.pulse[2] : 0.5
  const pFreq = P.pulse ? P.pulse[3] : 0.16
  const pWidth = P.pulse ? P.pulse[4] : 38
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = { value: rimColor }
    shader.uniforms.uRimPow = { value: power }
    shader.uniforms.uRimScale = { value: scale }
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uPulseCol = { value: PULSE_COL }
    shader.uniforms.uPulseAmp = { value: pAmp }
    shader.uniforms.uPulseSpeed = { value: pSpeed }
    shader.uniforms.uPulseFreq = { value: pFreq }
    shader.uniforms.uPulseWidth = { value: pWidth }
    shader.vertexShader =
      'varying vec3 vWP;\nvarying vec3 vWN;\n' +
      shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\n vWP = (modelMatrix * vec4(transformed,1.0)).xyz;\n vWN = normalize(mat3(modelMatrix) * objectNormal);',
      )
    shader.fragmentShader =
      'uniform vec3 uRim;\nuniform float uRimPow;\nuniform float uRimScale;\n' +
      'uniform float uTime;\nuniform vec3 uPulseCol;\nuniform float uPulseAmp;\n' +
      'uniform float uPulseSpeed;\nuniform float uPulseFreq;\nuniform float uPulseWidth;\n' +
      'varying vec3 vWP;\nvarying vec3 vWN;\n' +
      shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n' +
          ' float fres = pow(1.0 - clamp(dot(normalize(vWN), normalize(cameraPosition - vWP)), 0.0, 1.0), uRimPow);\n' +
          ' totalEmissiveRadiance += uRim * fres * uRimScale;\n' +
          ' float pd = length(vWP);\n' +
          ' float ph = fract(uTime * uPulseSpeed - pd * uPulseFreq);\n' +
          ' float ring = exp(-ph * ph * uPulseWidth) + exp(-(ph - 1.0) * (ph - 1.0) * uPulseWidth);\n' +
          ' totalEmissiveRadiance += uPulseCol * ring * uPulseAmp;\n',
      )
    pulseShaders.push(shader)
  }
  return material
}

// spec = [color, emissive, rimScale] uit het actieve palette.
function mat(spec, opts = {}) {
  const [color, emissive, rimScale] = spec
  const opaque = (opts.opacity ?? P.opacity) >= 0.999
  const m = new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: opts.emissiveIntensity ?? P.emI,
    metalness: opts.metalness ?? P.metal,
    roughness: opts.roughness ?? P.rough,
    transparent: !opaque,
    opacity: opts.opacity ?? P.opacity,
    depthWrite: opaque,
  })
  return addFresnel(m, RIM, opts.rimPow ?? P.rimPow, rimScale)
}

// Bouwt de catamaran. Retourneert { group, parts } met parts = Mesh[].
function buildCatamaran() {
  const group = new THREE.Group()
  const parts = []
  const bodyMat = mat(P.hull)
  // Rompen + trampoline kunnen eigen kleur hebben (mono); anders = romp.
  const hullMat = mat(P.hull2 ?? P.hull)
  const deckMat = mat(P.deck ?? P.hull)
  const sailMat = mat(P.sail, { opacity: P.sailOpacity })
  sailMat.side = THREE.DoubleSide
  // Beslag/blokken: feller, iets metalliger.
  const fitMat = mat(P.fit, {
    emissiveIntensity: P.emI * 1.4, metalness: Math.min(1, P.metal + 0.3),
    roughness: Math.max(0.25, P.rough - 0.2),
  })
  // Lopend want / draden.
  const wireMat = mat(P.wire, { emissiveIntensity: P.emI * 1.5 })

  const add = (geo, m, pos, rot = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, m)
    mesh.position.set(...pos)
    mesh.rotation.set(...rot)
    group.add(mesh)
    parts.push(mesh)
    return mesh
  }

  // ---- Modulaire part-factory: kleine herbruikbare bouwstenen. Elk part
  //      dat hier wordt aangemaakt belandt in parts[] en explodeert dus
  //      vanzelf mee de fibonacci-bol in. ----
  const F = {
    // Dunne staaf/draad tussen twee punten A en B.
    line(a, b, r, m = wireMat) {
      const A = new THREE.Vector3(...a)
      const B = new THREE.Vector3(...b)
      const dir = new THREE.Vector3().subVectors(B, A)
      const len = dir.length()
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 7), m)
      mesh.position.copy(A).addScaledVector(dir, 0.5)
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), dir.normalize(),
      )
      group.add(mesh)
      parts.push(mesh)
      return mesh
    },
    // Bout/schroef: kort cilindertje + zeskantkop.
    bolt(pos, r = 0.022, len = 0.12, rot = [0, 0, 0]) {
      const g = new THREE.Group()
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, len, 8), fitMat,
      )
      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 1.9, r * 1.9, r * 1.4, 6),
        fitMat,
      )
      head.position.y = len / 2 + r * 0.7
      g.add(shaft, head)
      g.position.set(...pos)
      g.rotation.set(...rot)
      group.add(g)
      parts.push(g)
      return g
    },
    // Katrol/blok: behuizing + draaiende schijf.
    block(pos, scale = 1, rot = [0, 0, 0]) {
      const g = new THREE.Group()
      const cheek = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.16, 0.1), fitMat,
      )
      const sheave = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.05, 14), fitMat,
      )
      sheave.rotation.x = Math.PI / 2
      sheave.position.y = -0.02
      const becket = new THREE.Mesh(
        new THREE.TorusGeometry(0.03, 0.011, 8, 14), fitMat,
      )
      becket.position.y = 0.11
      g.add(cheek, sheave, becket)
      g.scale.setScalar(scale)
      g.position.set(...pos)
      g.rotation.set(...rot)
      group.add(g)
      parts.push(g)
      return g
    },
    // Beslagplaat (chainplate / dekplaatje).
    plate(pos, w = 0.1, h = 0.18, rot = [0, 0, 0]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), fitMat)
      m.position.set(...pos)
      m.rotation.set(...rot)
      group.add(m)
      parts.push(m)
      return m
    },
    // Sluiting/ring (shackle).
    shackle(pos, R = 0.05, rot = [0, 0, 0]) {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(R, R * 0.26, 9, 18), fitMat,
      )
      m.position.set(...pos)
      m.rotation.set(...rot)
      group.add(m)
      parts.push(m)
      return m
    },
    // Klamp (cleat).
    cleat(pos, rot = [0, 0, 0]) {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.14, 7), fitMat,
      )
      m.position.set(...pos)
      m.rotation.set(Math.PI / 2, 0, 0)
      const g = new THREE.Group()
      g.add(m)
      g.position.set(...pos)
      g.rotation.set(...rot)
      m.position.set(0, 0, 0)
      group.add(g)
      parts.push(g)
      return g
    },
    // Generieke mesh (zoals oude `add`), maar via de factory.
    mesh: add,
  }

  // --- Rompen (slanke bootromp: zij-profiel geëxtrudeerd, getaperd naar
  //     een fijne opgewipte boeg en kleine spiegel — Nacra 15-silhouet) ---
  function buildHullGeometry() {
    const s = new THREE.Shape()
    // Kiel (onderlijn) van spiegel naar boeg, met lichte rocker.
    s.moveTo(-2.20, -0.10) // spiegel onder
    s.quadraticCurveTo(-1.20, -0.20, -0.20, -0.205) // rocker laagste
    s.quadraticCurveTo(1.10, -0.17, 1.60, -0.05)
    s.quadraticCurveTo(2.05, 0.05, 2.30, 0.30) // scherpe opgewipte boeg
    // Dek (bovenlijn) van boeg terug naar spiegel.
    s.quadraticCurveTo(2.18, 0.42, 1.60, 0.34)
    s.quadraticCurveTo(0.40, 0.29, -0.60, 0.27)
    s.quadraticCurveTo(-1.60, 0.25, -2.05, 0.22)
    s.lineTo(-2.20, 0.18) // spiegel boven
    s.lineTo(-2.20, -0.10)

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.46, bevelEnabled: true, bevelThickness: 0.04,
      bevelSize: 0.035, bevelSegments: 3, steps: 1, curveSegments: 18,
    })
    geo.center()

    // Breedte taperen langs de lengte: vol middenscheeps, fijn naar boeg
    // (scherper) en spiegel.
    const pos = geo.attributes.position
    let minX = Infinity, maxX = -Infinity
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
    }
    for (let i = 0; i < pos.count; i++) {
      const nx = (pos.getX(i) - minX) / (maxX - minX) // 0 spiegel .. 1 boeg
      let w = Math.max(0.16, Math.pow(Math.sin(Math.PI * nx), 0.45))
      if (nx > 0.78) w *= 1 - ((nx - 0.78) / 0.22) * 0.78 // scherpe boeg
      pos.setZ(i, pos.getZ(i) * w)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
  }
  for (const z of [-1.0, 1.0]) add(buildHullGeometry(), hullMat, [0, 0.05, z])

  // Dekhoogte: balken en trampoline liggen bóvenop de rompen.
  const DECK = 0.24
  const RAIL = 0.86 // z-positie van de romp-railing (binnenkant trampoline)

  // --- Dwarsbalken (voor/achter) — op de rompen ---
  const beamGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.3, 12)
  add(beamGeo, bodyMat, [1.1, DECK, 0], [Math.PI / 2, 0, 0])  // voorbalk
  add(beamGeo, bodyMat, [-1.0, DECK, 0], [Math.PI / 2, 0, 0]) // achterbalk

  // --- Trampoline-dek — op de rompen, tussen de balken ---
  add(new THREE.BoxGeometry(2.0, 0.025, 1.7), deckMat, [0.05, DECK + 0.02, 0])

  // --- Mast (hoog, lichte buiging via segmenten) ---
  const mast = add(new THREE.CylinderGeometry(0.06, 0.085, 7.4, 12), bodyMat, [0.9, 3.85, 0], [0, 0, -0.04])
  mast.name = 'mast'

  // --- Giek ---
  add(new THREE.CylinderGeometry(0.045, 0.045, 2.6, 10), bodyMat, [-0.35, 0.55, 0], [0, 0, Math.PI / 2])

  // === Finegetunede anker-/referentiepunten ===
  const mastTop = [0.80, 7.52, 0]
  const mastBase = [0.90, DECK + 0.02, 0]
  const goose = [0.92, 0.55, 0]            // gooseneck (giek↔mast)
  const boomEnd = [-1.62, 0.55, 0]         // achterkant giek
  const bridleRing = [2.18, 0.40, 0]       // voorstag-bridle knooppunt
  const bowDeck = (z) => [2.02, 0.34, z]   // boeg-dekhoek per romp
  const beamHull = (z) => [0.90, DECK + 0.02, z] // voorbalk↔romp aanslag

  // --- Mast step + gooseneck + beslag rond de mastvoet ---
  F.mesh(new THREE.BoxGeometry(0.16, 0.1, 0.2), fitMat, mastBase)
  F.mesh(new THREE.BoxGeometry(0.1, 0.12, 0.09), fitMat, goose)
  F.bolt([0.90, DECK + 0.06, 0.09], 0.02, 0.1, [Math.PI / 2, 0, 0])
  F.bolt([0.90, DECK + 0.06, -0.09], 0.02, 0.1, [Math.PI / 2, 0, 0])

  // --- Spreaders (zaling) + diamantdraden ---
  const spreaderY = 4.35
  const spreaderX = 0.90 - Math.sin(0.04) * (spreaderY - 3.85)
  const spTip = (z) => [spreaderX - 0.05, spreaderY, z * 0.34]
  for (const z of [-1.0, 1.0]) {
    F.mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.36, 8),
      fitMat,
      [spreaderX - 0.025, spreaderY, z * 0.18],
      [Math.PI / 2, 0, -0.12],
    )
    // Diamantdraad: mastfitting laag -> zalingtip -> mastfitting hoog.
    F.line([spreaderX + 0.04, spreaderY - 1.7, 0], spTip(z), 0.009)
    F.line(spTip(z), [spreaderX - 0.02, spreaderY + 1.7, 0], 0.009)
    F.shackle(spTip(z), 0.03, [0, 0, Math.PI / 2])
  }
  // Diamant-mastfittings (laag/hoog)
  F.plate([spreaderX + 0.05, spreaderY - 1.7, 0], 0.07, 0.12)
  F.plate([spreaderX - 0.03, spreaderY + 1.7, 0], 0.07, 0.12)

  // --- Staand want: voorstag + bridle + zijstagen ---
  F.line(mastTop, bridleRing, 0.013)               // voorstag
  F.shackle(mastTop, 0.05, [0, 0, Math.PI / 2])    // masttop-tang
  F.shackle(bridleRing, 0.045)
  for (const z of [-1.0, 1.0]) {
    F.line(bridleRing, bowDeck(z), 0.011)          // bridle-benen
    F.shackle(bowDeck(z), 0.038, [Math.PI / 2, 0, 0])
    F.plate([2.0, 0.30, z], 0.08, 0.16)            // boeg-chainplate
    F.bolt([2.0, 0.26, z], 0.018, 0.08, [Math.PI / 2, 0, 0])
  }
  for (const z of [-1.0, 1.0]) {
    F.line(mastTop, beamHull(z), 0.013)            // zijstag (shroud)
    F.plate([0.90, DECK + 0.02, z], 0.08, 0.18)    // shroud-chainplate
    F.shackle([0.90, DECK + 0.06, z], 0.036, [Math.PI / 2, 0, 0])
    F.bolt([0.90, DECK - 0.02, z], 0.018, 0.09, [Math.PI / 2, 0, 0])
  }

  // --- Dolphin striker (onder voorbalk/mast) ---
  const strikerTip = [1.1, -0.18, 0]
  F.mesh(
    new THREE.CylinderGeometry(0.03, 0.018, DECK + 0.18, 8),
    fitMat, [1.1, DECK / 2 - 0.09, 0],
  ) // verticale stut
  for (const z of [-1.0, 1.0]) {
    F.line(strikerTip, [1.1, DECK - 0.02, z * 1.05], 0.011) // spandraden
    F.shackle([1.1, DECK - 0.02, z * 1.05], 0.026, [Math.PI / 2, 0, 0])
  }
  F.shackle(strikerTip, 0.03)

  // --- Square-top grootzeil ---
  {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(2.5, 0.2)
    s.lineTo(0.55, 6.7)
    s.lineTo(-0.15, 6.95)
    s.lineTo(0, 0)
    add(new THREE.ShapeGeometry(s), sailMat, [0.9, 0.5, 0], [0, Math.PI, 0])
  }
  // --- Fok ---
  {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(1.5, 0.1)
    s.lineTo(0.1, 3.6)
    s.lineTo(0, 0)
    add(new THREE.ShapeGeometry(s), sailMat, [0.95, 0.4, 0], [0, 0, 0])
  }

  // --- Zeillatten (battens) — stijve dwarslatten, eigen parts ---
  const batten = (ax, ay, bx, by, r = 0.02) =>
    F.line([ax, ay, 0.015], [bx, by, 0.015], r, bodyMat)
  // Grootzeil: voorlijk (luff, bij mast) -> achterlijk (leech).
  // Wereldsilhouet na plaatsing [0.9,0.5,0] rot Y=PI.
  for (const f of [0.16, 0.33, 0.5, 0.66, 0.82, 0.95]) {
    const y = 0.5 + f * 6.7
    const luffX = 0.9 + 0.12 * f
    const leechX = -1.6 + 1.95 * f
    batten(luffX, y, leechX, y, f > 0.9 ? 0.03 : 0.022) // square-top dikker
  }
  // Fok: kleinere latten. Wereldsilhouet na [0.95,0.4,0] rot 0.
  for (const f of [0.28, 0.55, 0.8]) {
    const y = 0.4 + f * 3.5
    const luffX = 0.95 + 0.1 * f
    const leechX = 2.45 - 1.4 * f
    batten(leechX, y, luffX, y, 0.016)
  }

  // --- Roeren + vinger-/dolboordbeslag (gudgeons + helmstok) ---
  const rudderGeo = new THREE.BoxGeometry(0.06, 0.7, 0.28)
  for (const z of [-1.0, 1.0]) {
    add(rudderGeo, bodyMat, [-2.05, -0.42, z], [0, Math.PI / 2, 0])
    F.shackle([-2.04, -0.02, z], 0.035, [0, 0, Math.PI / 2]) // bovengudgeon
    F.shackle([-2.06, -0.3, z], 0.03, [0, 0, Math.PI / 2])   // ondergudgeon
    F.bolt([-2.0, -0.02, z], 0.016, 0.07)                    // pintle-bout
    // Helmstok-arm romp -> dwars-helmstok
    F.line([-2.0, 0.05, z], [-1.8, 0.15, z * 0.45], 0.018)
  }
  // Dwars-helmstok
  add(
    new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), bodyMat,
    [-1.8, 0.15, 0], [Math.PI / 2, 0, 0],
  )
  // Tiller-extension (hikingstick) + cardan-knoop
  F.shackle([-1.78, 0.16, 0], 0.028)
  F.mesh(
    new THREE.CylinderGeometry(0.018, 0.012, 1.25, 7), fitMat,
    [-1.35, 0.42, 0.32], [0, 0.4, -0.55],
  )
  F.mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.13, 8), fitMat,
    [-0.78, 0.66, 0.5], [0, 0.4, -0.55],
  ) // handvat-grip

  // --- Zwaarden (daggerboards) + kastbeslag ---
  const dbGeo = new THREE.BoxGeometry(0.05, 0.9, 0.22)
  for (const z of [-1.0, 1.0]) {
    add(dbGeo, bodyMat, [0.2, -0.55, z], [0, Math.PI / 2, 0])
    F.plate([0.2, DECK - 0.02, z], 0.26, 0.1, [0, Math.PI / 2, 0]) // kastdeksel
    F.bolt([0.34, DECK - 0.02, z], 0.014, 0.06)
    F.bolt([0.06, DECK - 0.02, z], 0.014, 0.06)
  }

  // --- Traveller (rail over achterbalk + slede + eindstops) ---
  const travY = DECK + 0.07
  add(new THREE.BoxGeometry(0.05, 0.03, 1.9), fitMat, [-1.0, travY, 0])
  F.mesh(new THREE.BoxGeometry(0.12, 0.07, 0.14), fitMat, [-1.0, travY + 0.03, 0]) // car
  for (const z of [-0.95, 0.95]) {
    F.mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), fitMat, [-1.0, travY, z]) // endstop
    F.cleat([-1.0, travY + 0.02, z * 0.7])
  }

  // --- Grootschoot-talie: blokken giek-eind ↔ traveller-car ---
  F.block([...boomEnd], 1.0, [0, 0, Math.PI])
  F.block([-1.0, travY + 0.12, 0], 1.0)
  F.shackle(boomEnd, 0.03)
  F.line(boomEnd, [-1.0, travY + 0.16, 0], 0.009)
  F.line([-1.05, travY + 0.16, 0.04], [-1.55, 0.5, 0.03], 0.009)
  F.line([-1.0, travY + 0.16, -0.04], [-1.0, DECK + 0.08, -0.5], 0.008) // valstaart

  // --- Boomvang/cunningham: giek-onderkant -> mastvoet ---
  F.line([-0.35, 0.5, 0], [0.78, DECK + 0.06, 0], 0.01)
  F.block([0.2, 0.35, 0], 0.8)

  // --- Fokkeschoten via voetblokken naar de rompen ---
  const jibClew = [2.45, 0.46, 0]
  for (const z of [-1.0, 1.0]) {
    F.block([1.05, DECK + 0.05, z * 0.7], 0.8)        // voetblok
    F.line(jibClew, [1.05, DECK + 0.1, z * 0.7], 0.009)
    F.line([1.05, DECK + 0.05, z * 0.7], [-0.2, DECK + 0.05, z * 0.78], 0.008)
    F.cleat([-0.2, DECK + 0.05, z * 0.78])
    F.shackle(jibClew, 0.03)
  }

  // --- Trapezedraden + handgrepen (beide zijden) ---
  for (const z of [-1.0, 1.0]) {
    const tHi = [spreaderX, 5.4, 0]
    F.line(tHi, [0.4, DECK + 0.05, z * RAIL], 0.008)
    F.mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.16, 7), fitMat,
      [0.6, 1.7, z * (RAIL - 0.1)],
    ) // trapeze-handvat
    F.shackle([0.4, DECK + 0.05, z * RAIL], 0.026, [Math.PI / 2, 0, 0])
  }

  // --- Trampoline-lacing: zigzag langs beide lange randen ---
  const xF = 1.02, xR = -0.92
  for (const z of [-1.0, 1.0]) {
    const edge = z * RAIL
    const segs = 8
    for (let i = 0; i < segs; i++) {
      const x0 = xR + (xF - xR) * (i / segs)
      const x1 = xR + (xF - xR) * ((i + 1) / segs)
      const inner = z * (RAIL - 0.13)
      F.line(
        [x0, DECK + 0.03, edge],
        [x1, DECK + 0.03, i % 2 ? edge : inner],
        0.006,
      )
    }
  }
  // Lacing langs de achterrand (tussen de rompen, langs achterbalk)
  for (let i = 0; i < 7; i++) {
    const z0 = -0.8 + (1.6 * i) / 7
    const z1 = -0.8 + (1.6 * (i + 1)) / 7
    F.line(
      [-0.92, DECK + 0.03, z0],
      [i % 2 ? -0.92 : -0.82, DECK + 0.03, z1],
      0.006,
    )
  }

  // --- Boutenrijen op de balk↔romp-aanslagen ---
  for (const bx of [1.1, -1.0]) {
    for (const z of [-1.0, 1.0]) {
      F.plate([bx, DECK + 0.01, z], 0.16, 0.12, [0, Math.PI / 2, 0])
      for (const dz of [-0.05, 0.05]) {
        F.bolt([bx + 0.05, DECK + 0.01, z + dz], 0.016, 0.09, [Math.PI / 2, 0, 0])
        F.bolt([bx - 0.05, DECK + 0.01, z + dz], 0.016, 0.09, [Math.PI / 2, 0, 0])
      }
    }
  }

  // Centreer de groep op zijn bounding-center.
  const box = new THREE.Box3().setFromObject(group)
  const center = box.getCenter(new THREE.Vector3())
  group.children.forEach((c) => c.position.sub(center))

  // Deterministische pseudo-random in [0,1).
  const rnd = (i, k) => {
    const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
    return s - Math.floor(s)
  }

  // Sla assembled transform op en bereken sphere-targets + genesis-herkomst.
  const radius = box.getSize(new THREE.Vector3()).length() * 0.4
  const targets = fibonacciSpherePoints(parts.length, radius)
  parts.forEach((mesh, i) => {
    mesh.userData.homePos = mesh.position.clone()
    mesh.userData.homeQuat = mesh.quaternion.clone()
    mesh.userData.target = new THREE.Vector3(targets[i].x, targets[i].y, targets[i].z)
    // willekeurige maar deterministische spin-as per part
    mesh.userData.spin = new THREE.Vector3(
      Math.sin(i * 1.3), Math.cos(i * 0.7), Math.sin(i * 2.1),
    ).normalize()

    // --- Genesis: verre herkomst (van alle kanten uit het duister) ---
    const u = rnd(i, 1) * 2 - 1
    const th = rnd(i, 2) * Math.PI * 2
    const sr = Math.sqrt(Math.max(0, 1 - u * u))
    const dist = 17 + rnd(i, 3) * 11
    mesh.userData.bornFrom = new THREE.Vector3(
      Math.cos(th) * sr, u * 0.8 + 0.25, Math.sin(th) * sr,
    ).multiplyScalar(dist)
    mesh.userData.delay = rnd(i, 4) * 0.95
    mesh.userData.flightDur = 1.15 + rnd(i, 5) * 0.55
    mesh.userData.turbPhase = rnd(i, 6) * Math.PI * 2
    // Start gescatterd zodat het eerste frame niet de assembled boot toont.
    mesh.position.copy(mesh.userData.bornFrom)
  })

  return { group, parts }
}

// Reproduceert de webapp-body-achtergrond als texture:
// crème basis-gradient + zachte groene (lo) en zandkleurige (ro) gloed.
function makeWebappBg() {
  const w = 1600
  const h = 1000
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const c = cv.getContext('2d')

  const base = c.createLinearGradient(0, 0, 0, h)
  base.addColorStop(0, '#F6F2E9')
  base.addColorStop(1, '#EFEFE8')
  c.fillStyle = base
  c.fillRect(0, 0, w, h)

  const glow = (cx, cy, r, hex) => {
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, hex)
    g.addColorStop(1, hex + '00') // zelfde kleur, alpha 0
    c.fillStyle = g
    c.fillRect(0, 0, w, h)
  }
  glow(0.15 * w, 0, 0.78 * w, '#E8F1E4') // groene gloed linksboven
  glow(0.95 * w, h, 0.62 * w, '#F0E3D4') // zandgloed rechtsonder

  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function createCatamaranScene(container, opts = {}) {
  const scene = new THREE.Scene()
  // bgCss → render de webapp-body-gradient als achtergrond-texture (zelfde
  // look als de site), zodat de fade naar Home naadloos oogt.
  scene.background = P.bgCss ? makeWebappBg() : new THREE.Color(P.bg)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(8.5, 3.4, 11.5)
  camera.lookAt(0, 0.2, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  if (P.shadow) {
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
  }
  container.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  const [hSky, hGround, hI, kCol, kI, rCol, rI] = P.lights
  scene.add(new THREE.HemisphereLight(hSky, hGround, hI))
  const key = new THREE.DirectionalLight(kCol, kI)
  key.position.set(6, 9, 7)
  if (P.shadow) {
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    const sc = key.shadow.camera
    sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9
    sc.near = 0.5; sc.far = 50
    key.shadow.bias = -0.0009
    key.shadow.radius = 3
  }
  scene.add(key)
  const rim = new THREE.DirectionalLight(rCol, rI)
  rim.position.set(-7, 3, -6)
  scene.add(rim)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), P.bloom, 0.55, 0.22)
  composer.addPass(bloom)

  pulseShaders.length = 0
  const { group, parts } = buildCatamaran()
  scene.add(group)

  if (P.shadow) {
    for (const m of parts) m.traverse((o) => { o.castShadow = true })
    // Bereik (assembled bbox + explode-bol-radius) bepaalt grondhoogte.
    const gb = new THREE.Box3().setFromObject(group)
    let reach = Math.max(Math.abs(gb.min.y), gb.max.y)
    for (const m of parts) reach = Math.max(reach, m.userData.target.length())
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.ShadowMaterial({ opacity: 0.26 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -reach - 0.6
    ground.receiveShadow = true
    scene.add(ground)
  }

  const _v = new THREE.Vector3()
  const _q = new THREE.Quaternion()

  function applyProgress(p) {
    for (const mesh of parts) {
      _v.copy(mesh.userData.homePos).lerp(mesh.userData.target, p)
      mesh.position.copy(_v)
      _q.setFromAxisAngle(mesh.userData.spin, p * Math.PI * 1.2)
      mesh.quaternion.copy(mesh.userData.homeQuat).multiply(_q)
    }
  }


  // easeOutBack: overshoot net vóór 1 → een "klik/snap" bij aankomst.
  const easeOutBack = (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    const u = t - 1
    return 1 + c3 * u * u * u + c1 * u * u
  }

  // --- Akte 1: genesis-storm (parts stormen aan, kolken, klikken samen).
  //     Akte 2: één klein pulsje (onderdelen iets uit elkaar en terug).
  //     Akte 3: boot blijft in elkaar, korte hold → door naar de pagina. ---
  let GEN_MAX = 0
  for (const m of parts) {
    GEN_MAX = Math.max(GEN_MAX, m.userData.delay + m.userData.flightDur)
  }
  GEN_MAX += 0.15
  const INTRO_DUR = 1.5 // s, één klein pulsje (uit/in)
  const PULSE_AMT = 0.06 // hoe ver de parts uit elkaar gaan bij het pulsje
  const FINALE_DUR = 0.8 // s, boot blijft in elkaar voor 'ie wegfade't
  const baseAmp = P.pulse ? P.pulse[1] : 0
  const camBase = camera.position.clone()

  let phase = 'genesis'
  let gT = 0
  let introT = 0
  let finaleT = 0
  let completed = false
  let shock = 0
  let shake = 0

  function applyGenesis() {
    for (const mesh of parts) {
      const d = mesh.userData
      const lt = Math.max(0, Math.min(1, (gT - d.delay) / d.flightDur))
      const e = easeOutBack(lt)
      _v.copy(d.bornFrom).lerp(d.homePos, e)
      const sw = 1 - lt // turbulentie sterft uit bij aankomst
      const tt = clock * 2.4 + d.turbPhase
      _v.x += Math.sin(tt) * 3.0 * sw
      _v.y += Math.cos(tt * 1.27) * 2.2 * sw
      _v.z += Math.sin(tt * 0.83 + 1.7) * 3.0 * sw
      mesh.position.copy(_v)
      _q.setFromAxisAngle(d.spin, (1 - lt) * Math.PI * 4)
      mesh.quaternion.copy(d.homeQuat).multiply(_q)
    }
  }

  let raf = 0
  let last = 0
  let clock = 0
  function loop(now) {
    raf = requestAnimationFrame(loop)
    const dt = last ? (now - last) / 1000 : 0
    last = now
    clock += dt
    group.rotation.y += dt * 0.18 // trage cinematic turn

    if (phase === 'genesis') {
      gT += dt
      applyGenesis()
      if (gT >= GEN_MAX) {
        phase = 'breathe'
        shock = 1 // schokgolf-flits op de snap
        shake = 1 // camera-shake
      }
    } else if (phase === 'breathe') {
      introT += dt
      const k = introT / INTRO_DUR // 0..1 → 0→1→0 (1x uit/in)
      applyProgress(PULSE_AMT * (0.5 - 0.5 * Math.cos(2 * Math.PI * k)))
      if (introT >= INTRO_DUR) phase = 'finale'
    } else {
      // Boot blijft in elkaar; korte hold, dan door naar de pagina.
      finaleT += dt
      applyProgress(0)
      if (finaleT >= FINALE_DUR && !completed) {
        completed = true
        opts.onComplete?.()
      }
    }

    // Schokgolf-flits: pomp de pulse-amplitude kort omhoog.
    shock = Math.max(0, shock - dt / 0.55)
    if (baseAmp > 0) {
      const amp = baseAmp * (1 + shock * 5.0)
      for (const s of pulseShaders) s.uniforms.uPulseAmp.value = amp
    }
    for (const s of pulseShaders) s.uniforms.uTime.value = clock

    // Camera-shake bij de snap, gedempt.
    shake = Math.max(0, shake - dt / 0.42)
    if (shake > 0) {
      const a = shake * shake * 0.55
      camera.position.set(
        camBase.x + Math.sin(clock * 91.0) * a,
        camBase.y + Math.sin(clock * 77.0) * a,
        camBase.z + Math.cos(clock * 63.0) * a,
      )
      camera.lookAt(0, 0.2, 0)
    } else if (camera.position.x !== camBase.x) {
      camera.position.copy(camBase)
      camera.lookAt(0, 0.2, 0)
    }

    composer.render()
  }

  function start() {
    if (!raf) { last = 0; raf = requestAnimationFrame(loop) }
  }

  function resize() {
    const w = container.clientWidth || 1
    const h = container.clientHeight || 1
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    bloom.setSize(w, h)
  }

  function dispose() {
    cancelAnimationFrame(raf)
    raf = 0
    const seen = new Set()
    scene.traverse((o) => {
      if (o.geometry && !seen.has(o.geometry)) {
        seen.add(o.geometry)
        o.geometry.dispose()
      }
      if (o.material && !seen.has(o.material)) {
        seen.add(o.material)
        o.material.dispose()
      }
    })
    composer.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }

  resize()
  return { start, resize, dispose, _parts: parts }
}
