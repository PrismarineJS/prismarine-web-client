import fs from 'fs'
import minecraftAssets from 'minecraft-assets'

const gen = JSON.parse(fs.readFileSync('./blocks.json', 'utf8'))

const version = '1.8.8'
const { blockNames, indexes } = gen

const blocksActual = indexes[version].map((i) => blockNames[i])

const blocksExpected = fs.readdirSync(minecraftAssets(version).directory + '/blocks')
for (const [i, item] of blocksActual.entries()) {
    if (item !== blocksExpected[i]) {
        console.log('not equal at', i)
    }
}
