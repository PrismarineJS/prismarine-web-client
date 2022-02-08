const fs = require('fs').promises
const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
// https://webpack.js.org/guides/production/

function filterExisting (directory = '') {
  const relative = path.resolve(__dirname, directory)
  return async function filter (pathname) {
    const { mtimeMs: modified } = await fs.stat(pathname)
    const buildname = path.resolve(config.output.path, path.relative(relative, pathname))
    try {
      const { mtimeMs: modifiedExisting } = await fs.stat(buildname)
      return modified > modifiedExisting
    } catch (e) {
      if (e.code === 'ENOENT') return true
      throw e
    }
  }
}

const config = {
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, './public'),
    filename: './index.js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      'minecraft-protocol': path.resolve(
        __dirname,
        'node_modules/minecraft-protocol/src/index.js'
      ), // Hack to allow creating the client in a browser
      express: false,
      net: 'net-browserify',
      fs: 'memfs',
      jose: false
    },
    fallback: {
      jose: false,
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      constants: require.resolve('constants-browserify'),
      os: require.resolve('os-browserify/browser'),
      http: require.resolve('http-browserify'),
      https: require.resolve('https-browserify'),
      timers: require.resolve('timers-browserify'),
      // fs: require.resolve("fs-memory/singleton"),
      child_process: false,
      tls: false,
      perf_hooks: path.resolve(__dirname, 'lib/perf_hooks_replacement.js'),
      dns: path.resolve(__dirname, 'lib/dns.js')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      hash: true,
      minify: false
    }),
    // fix "process is not defined" error:
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.NormalModuleReplacementPlugin(
      /prismarine-viewer[/|\\]viewer[/|\\]lib[/|\\]utils/,
      './utils.web.js'
    ),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      include: ['index.html', 'manifest.json'] // not caching a lot as anyway this works only online
    }),
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, '/styles.css'), to: './styles.css', filter: filterExisting() },
        { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/blocksStates/'), to: './blocksStates/', filter: filterExisting('/node_modules/prismarine-viewer/public/') },
        { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/textures/'), to: './textures/', filter: filterExisting('/node_modules/prismarine-viewer/public/') },
        { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/worker.js'), to: './', filter: filterExisting('/node_modules/prismarine-viewer/public/') },
        { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/supportedVersions.json'), to: './', filter: filterExisting('/node_modules/prismarine-viewer/public/') },
        { from: path.join(__dirname, 'assets/'), to: './', filter: filterExisting('assets/') },
        { from: path.join(__dirname, 'extra-textures/'), to: './extra-textures/', filter: filterExisting() },
        { from: path.join(__dirname, 'config.json'), to: './config.json', filter: filterExisting() }
      ]
    })
  ]
}

module.exports = config
