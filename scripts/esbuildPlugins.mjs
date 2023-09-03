//@ts-check

import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import { join, dirname } from 'path'
import * as fs from 'fs'
import { filesize } from 'filesize'

const prod = process.argv.includes('--prod')
let connectedClients = []

/** @type {import('esbuild').Plugin[]} */
const plugins = [
  {
    name: 'strict-aliases',
    setup (build) {
      build.onResolve({
        filter: /^minecraft-protocol$/,
      }, async ({ kind, resolveDir }) => {
        return {
          path: (await build.resolve('minecraft-protocol/src/index.js', { kind, resolveDir })).path,
        }
      })
      build.onResolve({
        filter: /^\.\/data.js$/,
      }, ({ resolveDir, path }) => {
        if (!resolveDir.endsWith('minecraft-data')) return
        return {
          namespace: 'load-global-minecraft-data',
          path
        }
      })
      build.onLoad({
        filter: /.+/,
        namespace: 'load-global-minecraft-data',
      }, () => {
        return {
          contents: 'window.mcData ??= {};module.exports = { pc: window.mcData }',
          loader: 'js',
        }
      })
      build.onResolve({
        filter: /^minecraft-assets$/,
      }, () => {
        throw new Error('hit banned package')
      })
    }
  },
  {
    name: 'data-assets',
    setup (build) {
      const customMcDataNs = 'custom-mc-data'

      build.onResolve({
        filter: /.*/,
      }, async ({ path, ...rest }) => {
        if (join(rest.resolveDir, path).replaceAll('\\', '/').endsWith('minecraft-data/data.js')) {
          throw new Error('Should not hit')
        }
        if (['.woff', '.woff2', '.ttf'].some(ext => path.endsWith(ext))) {
          return {
            path,
            namespace: 'assets',
            external: true,
          }
        }
      })

      build.onEnd(async ({ metafile, outputFiles }) => {
        // write outputFiles
        for (const file of outputFiles) {
          // if (file.path.endsWith('index.js.map')) {
          //   const map = JSON.parse(file.text)
          //   map.sourcesContent = map.sourcesContent.map((c, index) => {
          //     if (map.sources[index].endsWith('.json')) return ''
          //     return c
          //   })
          //   // data.sources = data.sources.filter(source => !source.endsWith('.json'))
          //   await fs.promises.writeFile(file.path, JSON.stringify(map), 'utf8')
          // } else {
          await fs.promises.writeFile(file.path, file.contents)
          // }
        }
        if (!prod) return
        // const deps = Object.entries(metafile.inputs).sort(([, a], [, b]) => b.bytes - a.bytes).map(([x, { bytes }]) => [x, filesize(bytes)]).slice(0, 5)
        //@ts-ignore
        const sizeByExt = {}
        //@ts-ignore
        Object.entries(metafile.inputs).sort(([, a], [, b]) => b.bytes - a.bytes).forEach(([x, { bytes }]) => {
          const ext = x.slice(x.lastIndexOf('.'))
          sizeByExt[ext] ??= 0
          sizeByExt[ext] += bytes
        })
        console.log('Input size by ext:')
        console.log(Object.fromEntries(Object.entries(sizeByExt).map(x => [x[0], filesize(x[1])])))
      })
    },
  },
  {
    name: 'prevent-incorrect-linking',
    setup (build) {
      build.onResolve({
        filter: /.+/,
      }, ({ resolveDir }) => {
        // disallow imports from outside the root directory to ensure modules are resolved from node_modules of this workspace
        if (!resolveDir.startsWith(process.cwd())) {
          throw new Error(`Restricted import from outside the root directory: ${resolveDir}`)
        }
        return undefined
      })
    }
  },
  {
    name: 'watch-notify',
    setup (build) {
      let count = 0
      let time
      build.onStart(() => {
        time = Date.now()
      })
      build.onEnd(({ errors, outputFiles, metafile, warnings }) => {
        const elapsed = Date.now() - time
        // write metafile to disk if needed
        // fs.writeFileSync('dist/meta.json', JSON.stringify(metafile, null, 2))
        console.log(`Done in ${elapsed}ms`)
        if (count++ === 0) {
          return
        }
        if (errors.length) {
          connectedClients.forEach((res) => {
            res.write(`data: ${JSON.stringify({ errors: errors.map(error => error.text) })}\n\n`)
            res.flush()
          })
          return
        }
        connectedClients.forEach((res) => {
          res.write(`data: ${JSON.stringify({ update: { time: elapsed } })}\n\n`)
          res.flush()
        })
        connectedClients.length = 0
      })
    }
  },
  {
    name: 'esbuild-readdir',
    setup (build) {
      build.onResolve({
        filter: /^esbuild-readdir:.+$/,
      }, ({ resolveDir, path }) => {
        return {
          namespace: 'esbuild-readdir',
          path,
          pluginData: {
            resolveDir: join(resolveDir, path.replace(/^esbuild-readdir:/, ''))
          },
        }
      })
      build.onLoad({
        filter: /.+/,
        namespace: 'esbuild-readdir',
      }, async ({ pluginData }) => {
        const { resolveDir } = pluginData
        const files = await fs.promises.readdir(resolveDir)
        return {
          contents: `module.exports = ${JSON.stringify(files)}`,
          resolveDir,
          loader: 'js',
        }
      })
    }
  },
  {
    name: 'esbuild-import-glob',
    setup (build) {
      build.onResolve({
        filter: /^esbuild-import-glob\(path:(.+),skipFiles:(.+)\)+$/,
      }, ({ resolveDir, path }) => {
        return {
          namespace: 'esbuild-import-glob',
          path,
          pluginData: {
            resolveDir
          },
        }
      })
      build.onLoad({
        filter: /.+/,
        namespace: 'esbuild-import-glob',
      }, async ({ pluginData, path }) => {
        const { resolveDir } = pluginData
        //@ts-ignore
        const [, userPath, skipFiles] = /^esbuild-import-glob\(path:(.+),skipFiles:(.+)\)+$/g.exec(path)
        const files = (await fs.promises.readdir(join(resolveDir, userPath))).filter(f => !skipFiles.includes(f))
        return {
          contents: `module.exports = { ${files.map(f => `'${f}': require('./${join(userPath, f)}')`).join(',')} }`,
          resolveDir,
          loader: 'js',
        }
      })
    }
  },
  {
    name: 'fix-dynamic-require',
    setup (build) {
      build.onResolve({
        filter: /1\.14\/chunk/,
      }, async ({ resolveDir, path }) => {
        if (!resolveDir.includes('prismarine-provider-anvil')) return
        return {
          namespace: 'fix-dynamic-require',
          path,
          pluginData: {
            resolvedPath: `${join(resolveDir, path)}.js`,
            resolveDir
          },
        }
      })
      build.onLoad({
        filter: /.+/,
        namespace: 'fix-dynamic-require',
      }, async ({ pluginData: { resolvedPath, resolveDir } }) => {
        const resolvedFile = await fs.promises.readFile(resolvedPath, 'utf8')
        return {
          contents: resolvedFile.replace("require(`prismarine-chunk/src/pc/common/BitArray${noSpan ? 'NoSpan' : ''}`)", "noSpan ? require(`prismarine-chunk/src/pc/common/BitArray`) : require(`prismarine-chunk/src/pc/common/BitArrayNoSpan`)"),
          resolveDir,
          loader: 'js',
        }
      })
    }
  },
  polyfillNode({
    polyfills: {
      fs: false,
      crypto: false,
      events: false,
      http: false,
      stream: false,
      buffer: false,
      perf_hooks: false,
      net: false,
    },
  })
]

export { plugins, connectedClients as clients }
