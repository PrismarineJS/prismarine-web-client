const fsExtra = require('fs-extra')

exports.copyFiles = () => {
    fsExtra.copySync('styles.css', 'public/styles.css')
    fsExtra.copySync('node_modules/prismarine-viewer/public/blocksStates/', 'public/blocksStates/')
    fsExtra.copySync('node_modules/prismarine-viewer/public/textures/', 'public/textures/')
    fsExtra.copySync('node_modules/prismarine-viewer/public/worker.js', 'public/worker.js')
    fsExtra.copySync('node_modules/prismarine-viewer/public/supportedVersions.json', 'public/supportedVersions.json')
    fsExtra.copySync('assets/', 'public/')
    fsExtra.copySync('extra-textures/', 'public/extra-textures/')
    fsExtra.copySync('config.json', 'public/config.json')
}

exports.copyFilesDev = () => {
    if (fsExtra.existsSync('public/config.json')) return
    exports.copyFiles()
}

const fn = exports[process.argv[2]]

if (fn) fn()
