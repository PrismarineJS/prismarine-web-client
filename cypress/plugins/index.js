//@ts-check
const { cypressEsbuildPreprocessor } = require('cypress-esbuild-preprocessor')
const { initPlugin } = require('cypress-plugin-snapshots/plugin')
const polyfill = require('esbuild-plugin-polyfill-node')

module.exports = (on, config) => {
  initPlugin(on, config)
  on('file:preprocessor', cypressEsbuildPreprocessor({
    esbuildOptions: {
      plugins: [
        polyfill.polyfillNode({
          polyfills: {
            crypto: true,
          },
        })
      ],
    },
  }))
  on('task', {
    log (message) {
      console.log(message)
      return null
    },
  })
  return config
}
