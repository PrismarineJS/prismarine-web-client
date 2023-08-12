const path = require('path')
const { makeTextureAtlas } = require('./lib/atlas')
const { prepareBlocksStates } = require('./lib/modelsBuilder')
const mcAssets = require('minecraft-assets')
const fs = require('fs-extra')

const texturesPath = path.resolve(__dirname, '../public/textures')
if (!fs.existsSync(texturesPath)) {
  fs.mkdirSync(texturesPath)
}

const blockStatesPath = path.resolve(__dirname, '../public/blocksStates')
if (!fs.existsSync(blockStatesPath)) {
  fs.mkdirSync(blockStatesPath)
}

for (const version of mcAssets.versions) {
  const assets = mcAssets(version)
  const atlas = makeTextureAtlas(assets)
  const out = fs.createWriteStream(path.resolve(texturesPath, version + '.png'))
  const stream = atlas.canvas.pngStream()
  stream.on('data', (chunk) => out.write(chunk))
  stream.on('end', () => console.log('Generated textures/' + version + '.png'))

  const blocksStates = JSON.stringify(prepareBlocksStates(assets, atlas))
  fs.writeFileSync(path.resolve(blockStatesPath, version + '.json'), blocksStates)

  fs.copySync(assets.directory, path.resolve(texturesPath, version), { overwrite: true })
}

fs.writeFileSync(path.resolve(__dirname, '../public/supportedVersions.json'), '[' + mcAssets.versions.map(v => `"${v}"`).toString() + ']')
