const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const CopyPlugin = require('copy-webpack-plugin')
const fs = require('fs')
const path = require('path')

class SymlinkPlugin {
  constructor (options) {
    this.directories = options.directories ?? []
  }

  apply (compiler) {
    compiler.hooks.afterEmit.tap(SymlinkPlugin.name, this.afterEmitHook.bind(this))
  }

  afterEmitHook (compilation) {
    const dir = compilation.options.context
    const output = compilation.outputOptions.path
    for (const { from: _from, to: _to } of this.directories) {
      const to = path.resolve(output, _to)
      if (fs.existsSync(to)) {
        try {
          fs.unlinkSync(to)
        } catch (e) {
          continue
        }
      }
      const from = path.resolve(dir, _from)
      fs.symlinkSync(from, to, 'junction')
    }
  }
}

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  cache: true,
  devServer: {
    contentBase: path.resolve(__dirname, './public'),
    compress: true,
    inline: true,
    // open: true,
    hot: true
  },
  plugins: [
    new CopyPlugin({ patterns: common[Symbol.for('webpack_files')] }),
    new SymlinkPlugin({ directories: common[Symbol.for('webpack_directories')] })
  ]
})
