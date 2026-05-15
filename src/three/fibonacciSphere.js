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
