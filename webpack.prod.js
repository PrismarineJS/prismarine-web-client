const SpeedMeasurePlugin = require("speed-measure-webpack-plugin") // TODO: Remove
const smp = new SpeedMeasurePlugin()

const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')
const WorkboxPlugin = require('workbox-webpack-plugin')

module.exports = smp.wrap(merge(common, {
  mode: 'production',
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
  ]
}))
