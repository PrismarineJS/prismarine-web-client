const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const path = require('path')

/** @type {import('webpack-dev-server').Configuration['rel']} */
module.exports = merge(common,
  /** @type {import('webpack').Configuration} */
  {
    mode: 'development',
    devtool: 'inline-source-map',
    cache: true,
    devServer: {
      // contentBase: path.resolve(__dirname, './public'),
      compress: true,
      // inline: true,
      // open: true,
      // hot: true,
      liveReload: true,
      devMiddleware: {
        writeToDisk: true,
      },
      port: 8081,
    },
    optimization: {
      splitChunks: {
        maxAsyncRequests: 10,
        maxInitialRequests: 10,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            chunks: 'all'
          }
        }
      }
    }
  })
