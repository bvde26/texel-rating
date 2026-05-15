import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function gitShortHash() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString().trim()
  } catch {
    return process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev'
  }
}

function versionPlugin() {
  const version = gitShortHash()
  const builtAt = new Date().toISOString()
  const payload = JSON.stringify({ version, builtAt })
  return {
    name: 'texel-version',
    config() {
      try {
        mkdirSync(resolve('public'), { recursive: true })
        writeFileSync(resolve('public/version.json'), payload)
      } catch {}
    },
    configureServer(server) {
      server.middlewares.use('/version.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(payload)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), versionPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(gitShortHash()),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
            if (id.includes('leaflet')) return 'leaflet'
            if (id.includes('react')) return 'react'
          }
        },
      },
    },
  },
})
