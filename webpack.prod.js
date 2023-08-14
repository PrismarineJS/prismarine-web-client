const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const webpack = require('webpack')

module.exports = merge(common, {
  output: {
    filename: './[name].js',
  },
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
    new webpack.DefinePlugin({
      // get from github actions or vercel env
      'process.env.GITHUB_URL': JSON.stringify(process.env.VERCEL_GIT_REPO_OWNER
        ? `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
        : process.env.GITHUB_REPOSITORY)
    })
  ],
})
