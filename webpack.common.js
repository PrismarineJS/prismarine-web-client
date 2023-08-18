const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// https://webpack.js.org/guides/production/

/** @type {import('webpack').Configuration} */
const config = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './public'),
    filename: './[name].js',
    publicPath: './',
    hotUpdateChunkFilename: 'hot/hot-update.[name].js',
    hotUpdateMainFilename: 'hot/hot-update.json'
  },
  resolve: {
    alias: {
      'fs': 'browserfs/dist/shims/fs.js',
      'buffer': 'browserfs/dist/shims/buffer.js',
      'path': 'browserfs/dist/shims/path.js',
      'processGlobal': 'browserfs/dist/shims/process.js',
      'bufferGlobal': 'browserfs/dist/shims/bufferGlobal.js',
      'bfsGlobal': require.resolve('browserfs'),

      'minecraft-protocol$': path.resolve(
        __dirname,
        'node_modules/minecraft-protocol/src/index.js'
      ), // Hack to allow creating the client in a browser
      express: false,
      net: 'net-browserify',
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
      child_process: false,
      tls: false,
      perf_hooks: path.resolve(__dirname, 'src/perf_hooks_replacement.js'),
      dns: path.resolve(__dirname, 'src/dns.js')
    },
    extensions: [
      '.js',
      '.ts',
      '.json'
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        // options: {
        //   // JavaScript version to compile to
        //   target: 'es2015'
        // }
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      hash: true,
      minify: false,
      chunks: ['main', 'vendors'],
    }),
    new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', /* process: 'processGlobal', */ Buffer: 'bufferGlobal' }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    // new webpack.ProvidePlugin({
    //   Buffer: ['buffer', 'Buffer']
    // }),
    new webpack.NormalModuleReplacementPlugin(
      /prismarine-viewer[/|\\]viewer[/|\\]lib[/|\\]utils/,
      './utils.web.js'
    ),
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, 'src/styles.css'), to: './styles.css' },
      ]
    })
  ]
}

module.exports = config
