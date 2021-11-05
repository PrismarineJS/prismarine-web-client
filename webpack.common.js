const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// https://webpack.js.org/guides/production/

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
      fs: 'memfs'
    },
    fallback: {
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
    )
  ],
  // The directories that can be optionally symlinked
  [Symbol.for('webpack_directories')]: [
    { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/blocksStates/'), to: './blocksStates/' },
    { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/textures/'), to: './textures/' },
    { from: path.join(__dirname, 'extra-textures/'), to: './extra-textures/' }
  ],
  // The files that will be copied
  [Symbol.for('webpack_files')]: [
    { from: path.join(__dirname, '/styles.css'), to: './styles.css' },
    { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/worker.js'), to: './' },
    { from: path.join(__dirname, '/node_modules/prismarine-viewer/public/supportedVersions.json'), to: './' },
    { from: path.join(__dirname, 'assets/'), to: './' },
    { from: path.join(__dirname, 'config.json'), to: './config.json' }
  ],
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  }
}

module.exports = config
