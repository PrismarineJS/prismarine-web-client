//@ts-check
import * as esbuild from 'esbuild'
import fs from 'fs'
// import htmlPlugin from '@chialab/esbuild-plugin-html'
import server from './server.js'
import { clients, plugins } from './scripts/esbuildPlugins.mjs'
import { generateSW } from 'workbox-build'
import { getSwAdditionalEntries } from './scripts/build.js'

/** @type {import('esbuild').BuildOptions} */
let baseConfig = {}

// // testing config
// baseConfig = {
//   entryPoints: ['files/index.js'],
//   outfile: 'out.js',
//   outdir: undefined,
// }

try {
  await import('./localSettings.mjs')
} catch { }

fs.writeFileSync('dist/index.html', fs.readFileSync('index.html', 'utf8').replace('<!-- inject script -->', '<script src="index.js"></script>'), 'utf8')

const watch = process.argv.includes('--watch') || process.argv.includes('-w')
const prod = process.argv.includes('--prod')
const dev = !prod

const banner = [
  'window.global = globalThis;',
  // report reload time
  dev && 'if (sessionStorage.lastReload) { const [rebuild, reloadStart] = sessionStorage.lastReload.split(","); const now = Date.now(); console.log(`rebuild + reload:`, +rebuild, "+", now - reloadStart, "=", ((+rebuild + (now - reloadStart)) / 1000).toFixed(1) + "s");sessionStorage.lastReload = ""; }',
  // auto-reload
  dev && ';(() => new EventSource("/esbuild").onmessage = ({ data: _data }) => { if (!_data) return; const data = JSON.parse(_data); if (!data.update) return; sessionStorage.lastReload = `${data.update.time},${Date.now()}`; location.reload() })();'
].filter(Boolean)

const buildingVersion = new Date().toISOString().split(':')[0]

const ctx = await esbuild.context({
  bundle: true,
  entryPoints: ['src/index.js'],
  target: ['es2020'],
  jsx: 'automatic',
  jsxDev: dev,
  // logLevel: 'debug',
  logLevel: 'info',
  platform: 'browser',
  sourcemap: true,
  outdir: 'dist',
  mainFields: [
    'browser', 'module', 'main'
  ],
  keepNames: true,
  ...baseConfig,
  banner: {
    js: banner.join('\n'),
  },
  alias: {
    events: 'events', // make explicit
    buffer: 'buffer',
    'fs': 'browserfs/dist/shims/fs.js',
    http: 'http-browserify',
    perf_hooks: './src/perf_hooks_replacement.js',
    crypto: './src/crypto.js',
    stream: 'stream-browserify',
    net: 'net-browserify',
    dns: './src/dns.js'
  },
  inject: [
    './src/shims.js'
  ],
  metafile: true,
  plugins: [
    ...plugins,
    ...baseConfig.plugins ?? [],
  ],
  minify: process.argv.includes('--minify'),
  define: {
    'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
    'process.env.BUILD_VERSION': JSON.stringify(!dev ? buildingVersion : 'undefined'),
    'process.env.GITHUB_URL':
      JSON.stringify(`https://github.com/${process.env.GITHUB_REPOSITORY || `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`}`)
  },
  loader: {
    // todo use external or resolve issues with duplicating
    '.png': 'dataurl'
  },
  write: false,
  // todo would be better to enable?
  // preserveSymlinks: true,
})

if (watch) {
  await ctx.watch()
  server.app.get('/esbuild', (req, res, next) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })

    // Send a comment to keep the connection alive
    res.write(': ping\n\n')

    // Add the client response to the clients array
    clients.push(res)

    // Handle any client disconnection logic
    res.on('close', () => {
      const index = clients.indexOf(res)
      if (index !== -1) {
        clients.splice(index, 1)
      }
    })
  })
} else {
  const result = await ctx.rebuild()
  // console.log(await esbuild.analyzeMetafile(result.metafile))

  if (prod) {
    fs.writeFileSync('dist/version.txt', buildingVersion, 'utf-8')

    const { count, size, warnings } = await generateSW({
      // dontCacheBustURLsMatching: [new RegExp('...')],
      globDirectory: 'dist',
      skipWaiting: true,
      clientsClaim: true,
      additionalManifestEntries: getSwAdditionalEntries(),
      globPatterns: [],
      swDest: 'dist/service-worker.js',
    })
  }

  await ctx.dispose()
}
