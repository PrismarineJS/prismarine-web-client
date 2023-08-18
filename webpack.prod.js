const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const webpack = require('webpack')
const fs = require('fs')

const buildingVersion = new Date().toISOString().split(':')[0]
fs.writeFileSync('public/version.txt', buildingVersion, 'utf-8')

module.exports = merge(common, {
  output: {
    filename: './[name].js',
  },
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new LodashModuleReplacementPlugin(),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      include: ['index.html', 'manifest.json', 'styles.css', /\.js$/, /\.woff$/, /\.ttf$/], // todo
      maximumFileSizeToCacheInBytes: 35_000_000, // todo will be lowered
      exclude: [/\.map$/, 'version.txt']
    }),
    new webpack.DefinePlugin({
      // get from github actions or vercel env
      'process.env.BUILD_VERSION': JSON.stringify(buildingVersion),
      'process.env.GITHUB_URL':
        JSON.stringify(`https://github.com/${process.env.GITHUB_REPOSITORY || `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`}`)
    })
  ],
})
