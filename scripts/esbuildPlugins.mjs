//@ts-check

import { polyfillNode } from 'esbuild-plugin-polyfill-node'
import { join, dirname } from 'path'
import * as fs from 'fs'
import { filesize } from 'filesize'

let clients = []

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
      // build.onResolve({
      //   filter: /^\.\/data.js$/,
      // }, ({ resolveDir, path }) => {
      //   if (!resolveDir.endsWith('minecraft-data')) return
      //   return {
      //     namespace: 'load-global-minecraft-data',
      //     path
      //   }
      // })
      // build.onLoad({
      //   filter: /.+/,
      //   namespace: 'load-global-minecraft-data',
      // }, () => {
      //   return {
      //     contents: 'module.exports = window.minecraftData',
      //     loader: 'js',
      //   }
      // })
      // build.onResolve({
      //   filter: /^minecraft-assets$/,
      // }, ({ resolveDir, path }) => {
      //   // if (!resolveDir.endsWith('minecraft-data')) return
      //   return {
      //     namespace: 'load-global-minecraft-assets',
      //     path
      //   }
      // })
      // build.onLoad({
      //   filter: /.+/,
      //   namespace: 'load-global-minecraft-assets',
      // }, async () => {
      //   const resolvedPath = await build.resolve('minecraft-assets/index.js', { kind: 'require-call', resolveDir: process.cwd() })
      //   let contents = (await fs.promises.readFile(resolvedPath.path, 'utf8'))
      //   contents = contents.slice(0, contents.indexOf('const data = ')) + 'const data = window.minecraftAssets;' + contents.slice(contents.indexOf('module.exports.versions'))
      //   return {
      //     contents,
      //     loader: 'js',
      //     resolveDir: dirname(resolvedPath.path),
      //   }
      // })
    }
  },
  {
    name: 'assets-resolve',
    setup (build) {
      build.onResolve({
        filter: /.*/,
      }, async ({ path, ...rest }) => {
        if (['.woff', '.woff2', '.ttf', '.png', '.jpg', '.jpeg', '.gif', '.svg'].some(ext => path.endsWith(ext))) {
          return {
            path,
            namespace: 'assets',
            external: true,
          }
        }
      })
      build.onEnd(({ metafile, outputFiles }) => {
        // top 5 biggest deps
        //@ts-ignore
        // const deps = Object.entries(metafile.inputs).sort(([, a], [, b]) => b.bytes - a.bytes).map(([x, { bytes }]) => [x, filesize(bytes)]).slice(0, 5)
        // console.log(deps)
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
        console.log(`Done in ${elapsed}ms`)
        if (count++ === 0) {
          return
        }
        if (errors.length) {
          clients.forEach((res) => {
            res.write(`data: ${JSON.stringify({ errors: errors.map(error => error.text) })}\n\n`)
            res.flush()
          })
          return
        }
        clients.forEach((res) => {
          res.write(`data: ${JSON.stringify({ update: { time: elapsed } })}\n\n`)
          res.flush()
        })
        clients.length = 0
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

export { plugins, clients }
