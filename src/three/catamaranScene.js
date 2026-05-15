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
  for (const z of [-1.0, 1.0]) add(buildHullGeometry(), bodyMat, [0, 0.05, z])

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
    // Zeil in het fore-aft vlak (normaal langs Z), achter de mast.
    add(geo, sailMat, [0.9, 0.5, 0], [0, Math.PI, 0])
  }

  // --- Fok (kleiner, voorin) ---
  {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(1.5, 0.1)
    s.lineTo(0.1, 3.6)
    s.lineTo(0, 0)
    const geo = new THREE.ShapeGeometry(s)
    // Fok in hetzelfde vlak, voor de mast richting boeg.
    add(geo, sailMat, [0.95, 0.4, 0], [0, 0, 0])
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
  })

  return { group, parts }
}

export function createCatamaranScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xe9eaec) // strakke studio-achtergrond

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.set(8.5, 3.4, 11.5)
  camera.lookAt(0, 0.2, 0)

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
  let last = 0
  function loop(now) {
    raf = requestAnimationFrame(loop)
    const dt = last ? (now - last) / 1000 : 0
    last = now
    group.rotation.y += dt * 0.18 // trage cinematic turn
    renderer.render(scene, camera)
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
    renderer.dispose()
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }

  resize()
  update(0)
  return { update, start, resize, dispose, _parts: parts }
}
