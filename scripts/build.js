//@ts-check
const fsExtra = require('fs-extra')
const defaultLocalServerOptions = require('../src/defaultLocalServerOptions')
const glob = require('glob')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')

const prismarineViewerBase = "./node_modules/prismarine-viewer"

// these files could be copied at build time eg with copy plugin, but copy plugin slows down the config so we copy them there, alternative we could inline it in esbuild config
const filesToCopy = [
    { from: `${prismarineViewerBase}/public/blocksStates/`, to: 'dist/blocksStates/' },
    { from: `${prismarineViewerBase}/public/worker.js`, to: 'dist/worker.js' },
    { from: './assets/', to: './dist/' },
    { from: './config.json', to: 'dist/config.json' },
    { from: `${prismarineViewerBase}/public/textures/1.16.4/entity`, to: 'dist/textures/1.16.4/entity' },
]
exports.filesToCopy = filesToCopy
exports.copyFiles = () => {
    console.time('copy files')
    // copy glob
    const cwd = `${prismarineViewerBase}/public/textures/`
    const files = glob.sync('*.png', { cwd: cwd, nodir: true, })
    for (const file of files) {
        const copyDest = path.join('dist/textures/', file)
        fs.mkdirSync(path.dirname(copyDest), { recursive: true, })
        fs.copyFileSync(path.join(cwd, file), copyDest)
    }

    filesToCopy.forEach(file => {
        fsExtra.copySync(file.from, file.to)
    })

    console.timeEnd('copy files')
}

exports.copyFilesDev = () => {
    if (fsExtra.existsSync('dist/config.json')) return
    exports.copyFiles()
}

exports.getSwAdditionalEntries = () => {
    // need to be careful with this
    const singlePlayerVersion = defaultLocalServerOptions.version
    const filesToCachePatterns = [
        'index.html',
        'index.js',
        'index.css',
        'favicon.ico',
        `mc-data/${defaultLocalServerOptions.versionMajor}.js`,
        `blocksStates/${singlePlayerVersion}.json`,
        'extra-textures/**',
        // todo-low copy from assets
        '*.mp3',
        '*.ttf',
        '*.png',
        '*.woff',
        'worker.js',
        // todo-low preload entity atlas?
        `textures/${singlePlayerVersion}.png`,
        `textures/1.16.4/entity/squid.png`,
    ]
    const filesNeedsCacheKey = [
        'index.js',
        'index.css',
        'worker.js',
    ]
    const output = []
    console.log('Generating sw additional entries...')
    for (const pattern of filesToCachePatterns) {
        const files = glob.sync(pattern, { cwd: 'dist' })
        for (const file of files) {
            const fullPath = path.join('dist', file)
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
