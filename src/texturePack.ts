import { join, dirname } from 'path'
import fs from 'fs'
import JSZip from 'jszip'
import type { Viewer } from 'prismarine-viewer/viewer/lib/viewer'
import { subscribeKey } from 'valtio/utils'
import { proxy, ref } from 'valtio'
import blocksFileNames from '../generated/blocks.json'
import { showNotification } from './menus/notification'
import type { BlockStates } from './inventory'
import { removeFileRecursiveAsync } from './browserfs'
import { setLoadingScreenStatus } from './utils'

export const resourcePackState = proxy({
    resourcePackInstalled: false,
    currentTexturesDataUrl: undefined as string | undefined,
    currentTexturesBlockStates: undefined as BlockStates | undefined,
})

function nextPowerOfTwo(n) {
    if (n === 0) return 1
    n--
    n |= n >> 1
    n |= n >> 2
    n |= n >> 4
    n |= n >> 8
    n |= n >> 16
    return n + 1
}

const mkdirRecursive = async (path) => {
    const parts = path.split('/')
    let current = ''
    for (const part of parts) {
        current += part + '/'
        try {
            await fs.promises.mkdir(current)
        } catch (err) {
        }
    }
}

const texturePackBasePath = '/userData/resourcePacks/default'
export const uninstallTexturePack = async () => {
    await removeFileRecursiveAsync(texturePackBasePath)
    setCustomTexturePackData(undefined, undefined)
}

export const getResourcePackName = async () => {
    // temp
    try {
        return await fs.promises.readFile(join(texturePackBasePath, 'name.txt'), 'utf8')
    } catch (err) {
        return '???'
    }
}

export const fromTexturePackPath = (path) => {
    return join(texturePackBasePath, path)
}

export const updateTexturePackInstalledState = async () => {
    try {
        resourcePackState.resourcePackInstalled = await existsAsync(texturePackBasePath)
    } catch {
    }
}

export const installTexturePack = async (file: File | ArrayBuffer) => {
    try {
        await uninstallTexturePack()
    } catch (err) {
    }
    const status = 'Installing resource pack: copying all files'
    setLoadingScreenStatus(status)
    // extract the zip and write to fs every file in it
    const zip = new JSZip()
    const zipFile = await zip.loadAsync(file)
    if (!zipFile.file('pack.mcmeta')) throw new Error('Not a resource pack: missing pack.mcmeta')
    await mkdirRecursive(texturePackBasePath)

    const allFilesArr = Object.entries(zipFile.files)
    let done = 0
    const upStatus = () => {
        setLoadingScreenStatus(`${status} ${Math.round(++done / allFilesArr.length * 100)}%`)
    }
    await Promise.all(allFilesArr.map(async ([path, file]) => {
        const writePath = join(texturePackBasePath, path)
        if (path.endsWith('/')) return
        await mkdirRecursive(dirname(writePath))
        await fs.promises.writeFile(writePath, Buffer.from(await file.async('arraybuffer')))
        done++
        upStatus()
    }))
    await fs.promises.writeFile(join(texturePackBasePath, 'name.txt'), file['name'] ?? '??', 'utf8')

    if (viewer?.world.active) {
        await genTexturePackTextures(viewer.version)
    }
    setLoadingScreenStatus(undefined)
    showNotification({
        message: 'Texturepack installed!',
    })
}

const existsAsync = async (path) => {
    try {
        await fs.promises.stat(path)
        return true
    } catch (err) {
        return false
    }
}

type TextureResolvedData = {
    blockSize: number
    // itemsUrlContent: string
}

const arrEqual = (a: any[], b: any[]) => a.length === b.length && a.every((x) => b.includes(x))

const applyTexturePackData = async (version: string, { blockSize }: TextureResolvedData, blocksUrlContent: string) => {
    const result = await fetch(`blocksStates/${version}.json`)
    const blockStates: BlockStates = await result.json()
    const factor = blockSize / 16

    // this will be refactored with generateTextures refactor
    const processObj = (x) => {
        if (typeof x !== 'object' || !x) return
        if (Array.isArray(x)) {
            for (const v of x) {
                processObj(v)
            }

        } else {
            const actual = Object.keys(x)
            const needed = ['u', 'v', 'su', 'sv']

            if (!arrEqual(actual, needed)) {
                for (const v of Object.values(x)) {
                    processObj(v)
                }
                return
            }
            for (const k of needed) {
                x[k] *= factor
            }
        }
    }
    processObj(blockStates)
    setCustomTexturePackData(blocksUrlContent, blockStates)
}

const setCustomTexturePackData = (blockTextures, blockStates) => {
    resourcePackState.currentTexturesBlockStates = blockStates && ref(blockStates)
    resourcePackState.currentTexturesDataUrl = blockTextures
    resourcePackState.resourcePackInstalled = blockTextures !== undefined
}

const getSizeFromImage = async (filePath: string) => {
    const probeImg = new Image()
    const file = await fs.promises.readFile(filePath, 'base64')
    probeImg.src = `data:image/png;base64,${file}`
    await new Promise((resolve, reject) => {
        probeImg.addEventListener('load', resolve)
    })
    if (probeImg.width !== probeImg.height) throw new Error(`Probe texture ${filePath} is not square`)
    return probeImg.width
}

export const genTexturePackTextures = async (version: string) => {
    setCustomTexturePackData(undefined, undefined)
    let blocksBasePath = '/userData/resourcePacks/default/assets/minecraft/textures/block'
    // todo not clear why this is needed
    const blocksBasePathAlt = '/userData/resourcePacks/default/assets/minecraft/textures/blocks'
    const blocksGenereatedPath = `/userData/resourcePacks/default/${version}.png`
    const genereatedPathData = `/userData/resourcePacks/default/${version}.json`
    if (!(await existsAsync(blocksBasePath))) {
        if (await existsAsync(blocksBasePathAlt)) {
            blocksBasePath = blocksBasePathAlt
        } else {
            return
        }
    }
    if (await existsAsync(blocksGenereatedPath)) {
        applyTexturePackData(version, JSON.parse(await fs.promises.readFile(genereatedPathData, 'utf8')), await fs.promises.readFile(blocksGenereatedPath, 'utf8'))
        return
    }

    setLoadingScreenStatus('Generating custom textures')

    const textureFiles = blocksFileNames.indexes[version].map(k => blocksFileNames.blockNames[k])
    textureFiles.unshift('missing_texture.png')

    const texSize = nextPowerOfTwo(Math.ceil(Math.sqrt(textureFiles.length)))
    const originalTileSize = 16

    const firstBlockFile = (await fs.promises.readdir(blocksBasePath)).find(f => f.endsWith('.png'))
    if (!firstBlockFile) {
        return
    }

    // we get the size of image from the first block file, which is not ideal but works in 99% cases
    const tileSize = await getSizeFromImage(join(blocksBasePath, firstBlockFile))

    const imgSize = texSize * tileSize

    const canvas = document.createElement('canvas')
    canvas.width = imgSize
    canvas.height = imgSize
    const src = `textures/${version}.png`
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const img = new Image()
    img.src = src
    await new Promise((resolve, reject) => {
        img.onerror = reject
        img.addEventListener('load', resolve)
    })
    for (const [i, fileName] of textureFiles.entries()) {
        const x = (i % texSize) * tileSize
        const y = Math.floor(i / texSize) * tileSize
        const xOrig = (i % texSize) * originalTileSize
        const yOrig = Math.floor(i / texSize) * originalTileSize
        let imgCustom: HTMLImageElement
        try {
            const fileBase64 = await fs.promises.readFile(join(blocksBasePath, fileName), 'base64')
            const _imgCustom = new Image()
            await new Promise<void>(resolve => {
                _imgCustom.addEventListener('load', () => {
                    imgCustom = _imgCustom
                    resolve()
                })
                _imgCustom.onerror = () => {
                    console.log('Skipping issued texture', fileName)
                    resolve()
                }
                _imgCustom.src = `data:image/png;base64,${fileBase64}`
            })
        } catch {
            console.log('Skipping not found texture', fileName)
        }

        if (imgCustom) {
            ctx.drawImage(imgCustom, x, y, tileSize, tileSize)
        } else {
            // todo this involves incorrect mappings for existing textures when the size is different
            ctx.drawImage(img, xOrig, yOrig, originalTileSize, originalTileSize, x, y, tileSize, tileSize)
        }
    }
    const blockDataUrl = canvas.toDataURL('image/png')
    const newData: TextureResolvedData = {
        blockSize: tileSize,
    }
    await fs.promises.writeFile(genereatedPathData, JSON.stringify(newData), 'utf8')
    await fs.promises.writeFile(blocksGenereatedPath, blockDataUrl, 'utf8')
    await applyTexturePackData(version, newData, blockDataUrl)

    // const a = document.createElement('a')
    // a.href = dataUrl
    // a.download = 'pack.png'
    // a.click()
}

export const watchTexturepackInViewer = (viewer: Viewer) => {
    subscribeKey(resourcePackState, 'currentTexturesDataUrl', () => {
        console.log('applying resourcepack world data')
        viewer.world.texturesDataUrl = resourcePackState.currentTexturesDataUrl
        viewer.world.blockStatesData = resourcePackState.currentTexturesBlockStates
        if (!viewer?.world.active) return
        viewer.world.updateTexturesData()
    })
}
