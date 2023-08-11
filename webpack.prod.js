const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new LodashModuleReplacementPlugin(),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      include: ['index.html', 'manifest.json'] // not caching a lot as anyway this works only online
    }),
    new webpack.ProvidePlugin({
      // get from github actions or vercel env
      GITHUB_URL: process.env.VERCEL_GIT_REPO_OWNER
        ? `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
        : process.env.GITHUB_REPOSITORY
    })
  ],
})
