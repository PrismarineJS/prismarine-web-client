const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const { EsbuildPlugin } = require('esbuild-loader')

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const webpack = require('webpack')
const fs = require('fs')
const CopyPlugin = require('copy-webpack-plugin')
const { webpackFilesToCopy, getSwAdditionalEntries } = require('./scripts/build.js')

const buildingVersion = new Date().toISOString().split(':')[0]
fs.writeFileSync('public/version.txt', buildingVersion, 'utf-8')

module.exports = merge(common, {
  output: {
    filename: './[name].js',
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new EsbuildPlugin({
        // would be better to use 2019 with polyfilling bigints (disabling them?)
        target: 'es2021'  // Syntax to transpile to (see options below for possible values)
      })
    ]
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new LodashModuleReplacementPlugin(),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 35_000_000, // todo will be lowered
      additionalManifestEntries: getSwAdditionalEntries(),
      exclude: [/\.map$/, 'version.txt']
    }),
    // new CopyPlugin({
    //   patterns: webpackFilesToCopy
    // }),
    new webpack.DefinePlugin({
      // get from github actions or vercel env
      'process.env.BUILD_VERSION': JSON.stringify(buildingVersion),
      'process.env.GITHUB_URL':
        JSON.stringify(`https://github.com/${process.env.GITHUB_REPOSITORY || `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`}`)
    })
  ],
})
