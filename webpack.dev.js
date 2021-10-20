const SpeedMeasurePlugin = require("speed-measure-webpack-plugin") // TODO: Remove
const smp = new SpeedMeasurePlugin()

const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')

module.exports = smp.wrap(merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  cache: true,
  devServer: {
    contentBase: path.resolve(__dirname, './public'),
    compress: true,
    inline: true,
    // open: true,
    hot: true
  }
}))
