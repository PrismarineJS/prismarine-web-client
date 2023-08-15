const { cypressEsbuildPreprocessor } = require('cypress-esbuild-preprocessor')

module.exports = on => {
    on('file:preprocessor', cypressEsbuildPreprocessor())
    on('task', {
        log(message) {
            console.log(message)
            return null
        },
    })
}
