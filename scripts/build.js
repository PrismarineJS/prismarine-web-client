const fsExtra = require('fs-extra')
const defaultLocalServerOptions = require('../src/defaultLocalServerOptions')
const glob = require('glob')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

// these files need to be copied before build for now
const filesAlwaysToCopy = [
    { from: './node_modules/prismarine-viewer2/public/supportedVersions.json', to: './prismarine-viewer/public/supportedVersions.json' },
]
// these files could be copied at build time eg with copy plugin, but copy plugin slows down the config (2x in my testing, sometimes with too many open files error) is slow so we also copy them there
const webpackFilesToCopy = [
    { from: './node_modules/prismarine-viewer2/public/blocksStates/', to: 'public/blocksStates/' },
    { from: './node_modules/prismarine-viewer2/public/textures/', to: 'public/textures/' },
    { from: './node_modules/prismarine-viewer2/public/worker.js', to: 'public/worker.js' },
    { from: './node_modules/prismarine-viewer2/public/supportedVersions.json', to: 'public/supportedVersions.json' },
    { from: './assets/', to: './public/' },
    { from: './config.json', to: 'public/config.json' }
]
exports.webpackFilesToCopy = webpackFilesToCopy
exports.copyFiles = (isDev = false) => {
    [...filesAlwaysToCopy, ...webpackFilesToCopy].forEach(file => {
        fsExtra.copySync(file.from, file.to)
    })
}

exports.copyFilesDev = () => {
    if (fsExtra.existsSync('public/config.json')) return
    exports.copyFiles(true)
}

exports.getSwAdditionalEntries = () => {
    // need to be careful with this
    const singlePlayerVersion = defaultLocalServerOptions.version
    const filesToCachePatterns = [
        `blocksStates/${singlePlayerVersion}.json`,
        'extra-textures/**',
        // todo-low copy from assets
        '*.mp3',
        '*.ttf',
        '*.png',
        '*.woff',
        'worker.js',
        // todo add gui textures (1.17.1)
        // todo if we uncomment it it will spam the server with requests for textures on initial page load
        // we need to put all textures into on file instead!
        // `textures/${singlePlayerVersion}/**`,
        `textures/${singlePlayerVersion}/blocks/destroy_stage_0.png.png`,
        `textures/${singlePlayerVersion}/blocks/destroy_stage_1.png.png`,
        `textures/${singlePlayerVersion}.png`,
        `textures/1.16.4/gui/widgets.png`,
        `textures/1.16.4/gui/icons.png`,
        `textures/1.16.4/entity/squid.png`,
    ]
    const filesNeedsCacheKey = [
        'worker.js',
    ]
    const output = []
    console.log('Generating sw additional entries...')
    for (const pattern of filesToCachePatterns) {
        const files = glob.sync(pattern, { cwd: 'public' })
        for (const file of files) {
            const fullPath = path.join('public', file)
            if (!fs.lstatSync(fullPath).isFile()) continue
            let revision = null
            const url = './' + file.replace(/\\/g, '/')
            if (filesNeedsCacheKey.includes(file)) {
                const fileContents = fs.readFileSync(fullPath, 'utf-8')
                const md5Hash = crypto.createHash('md5').update(fileContents).digest('hex')
                revision = md5Hash
            }
            output.push({ url, revision })
        }
    }
    console.log(`Got ${output.length} additional sw entries to cache`)
    return output
}

const fn = require.main === module && exports[process.argv[2]]

if (fn) {
    const result = fn()
    if (result) console.log(result)
}
