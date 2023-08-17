const fsExtra = require('fs-extra')

exports.copyFiles = () => {
    fsExtra.copySync('./node_modules/prismarine-viewer2/public/blocksStates/', 'public/blocksStates/')
    fsExtra.copySync('./node_modules/prismarine-viewer2/public/textures/', 'public/textures/')
    fsExtra.copySync('./node_modules/prismarine-viewer2/public/worker.js', 'public/worker.js')
    fsExtra.copySync('./node_modules/prismarine-viewer2/public/supportedVersions.json', 'public/supportedVersions.json')
    fsExtra.copySync('./node_modules/prismarine-viewer2/public/supportedVersions.json', './prismarine-viewer/public/supportedVersions.json')
    fsExtra.copySync('./assets/', './public/')
    fsExtra.copySync('./extra-textures/', 'public/extra-textures/')
    fsExtra.copySync('./config.json', 'public/config.json')
}

exports.copyFilesDev = () => {
    if (fsExtra.existsSync('public/config.json')) return
    exports.copyFiles()
}

const fn = exports[process.argv[2]]

if (fn) fn()
