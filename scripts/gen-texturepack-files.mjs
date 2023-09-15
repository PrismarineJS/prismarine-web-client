//@ts-check
import fs from 'fs'
import minecraftAssets from 'minecraft-assets'

// why store another data?
// 1. want to make it compatible (at least for now)
// 2. don't want to read generated blockStates as it might change in future, and the current way was faster to implement

const blockNames = []
const indexesPerVersion = {}
/** @type {Map<string, number>} */
const allBlocksMap = new Map()
const getBlockIndex = (block) => {
    if (allBlocksMap.has(block)) {
        return allBlocksMap.get(block)
    }

    const index = blockNames.length
    allBlocksMap.set(block, index)
    blockNames.push(block)
    return index
}

// const blocksFull = []
// const allBlocks = []
// // we can even optimize it even futher by doing prev-step resolving
// const blocksDiff = {}

for (const [i, version] of minecraftAssets.versions.reverse().entries()) {
    const assets = minecraftAssets(version)
    const blocksDir = assets.directory + '/blocks'
    const blocks = fs.readdirSync(blocksDir)
    indexesPerVersion[version] = blocks.map(block => {
        if (!block.endsWith('.png')) return undefined
        return getBlockIndex(block)
    }).filter(i => i !== undefined)

    // if (!blocksFull.length) {
    //     // first iter
    //     blocksFull.push(...blocks)
    // } else {
    //     const missing = blocksFull.map((b, i) => !blocks.includes(b) ? i : -1).filter(i => i !== -1)
    //     const added = blocks.filter(b => !blocksFull.includes(b))
    //     blocksDiff[version] = {
    //         missing,
    //         added
    //     }
    // }
}

fs.mkdirSync('./generated', { recursive: true, })
fs.writeFileSync('./generated/blocks.json', JSON.stringify({ blockNames: blockNames, indexes: indexesPerVersion }))
