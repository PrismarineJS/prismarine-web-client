import fs from 'fs'
import { promisify } from 'util'
import { supportedVersions } from 'flying-squid/src/lib/version'
import * as nbt from 'prismarine-nbt'
import { proxy } from 'valtio'
import { gzip } from 'node-gzip'
import { options } from './optionsStorage'
import { nameToMcOfflineUUID } from './utils'
import { forceCachedDataPaths } from './browserfs'

const parseNbt = promisify(nbt.parse)

// additional fs metadata
export const fsState = proxy({
  isReadonly: false,
  syncFs: false,
  inMemorySave: false,
  saveLoaded: false
})

const PROPOSE_BACKUP = true

// eslint-disable-next-line complexity
export const loadSave = async (root = '/world') => {
  const disablePrompts = options.disableLoadPrompts

  // todo do it in singleplayer as well
  // eslint-disable-next-line guard-for-in
  for (const key in forceCachedDataPaths) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete forceCachedDataPaths[key]
  }

  const warnings: string[] = []
  let levelDatContent
  try {
    // todo-low cache reading
    levelDatContent = await fs.promises.readFile(`${root}/level.dat`)
  } catch (err) {
    if (err.code === 'ENOENT') {
      if (fsState.isReadonly) {
        throw new Error('level.dat not found, ensure you are loading world folder')
      } else {
        warnings.push('level.dat not found, world in current folder will be created')
      }
    } else {
      throw err
    }
  }

  let version: string | undefined
  let isFlat = false
  if (levelDatContent) {
    const parsedRaw = await parseNbt(Buffer.from(levelDatContent))
    const levelDat: import('./mcTypes').LevelDat = nbt.simplify(parsedRaw).Data

    const qs = new URLSearchParams(window.location.search)
    version = levelDat.Version?.Name ?? qs.get('mapVersion')
    if (!version) {
      const newVersion = disablePrompts ? '1.8.8' : prompt(`In 1.8 and before world save doesn't contain version info, please enter version you want to use to load the world.\nSupported versions ${supportedVersions.join(', ')}`, '1.8.8')
      if (!newVersion) return
      version = newVersion
    }
    if (!supportedVersions.includes(version)) {
      version = prompt(`Version ${version} is not supported, supported versions ${supportedVersions.join(', ')}, what try to use instead?`, '1.16.1')
      if (!version) return
    }
    if (levelDat.WorldGenSettings) {
      for (const [key, value] of Object.entries(levelDat.WorldGenSettings.dimensions)) {
        if (key.slice(10) === 'overworld') {
          if (value.generator.type === 'flat') isFlat = true
          break
        }
      }
    }

    if (levelDat.generatorName) {
      isFlat = levelDat.generatorName === 'flat'
    }
    if (!isFlat && levelDat.generatorName !== 'default' && levelDat.generatorName !== 'customized') {
      warnings.push(`Generator ${levelDat.generatorName} may not be supported yet`)
    }

    const playerUuid = nameToMcOfflineUUID(options.localUsername)
    const playerDatPath = `${root}/playerdata/${playerUuid}.dat`
    try {
      await fs.promises.stat(playerDatPath)
    } catch (err) {
      const playerDat = await gzip(nbt.writeUncompressed({ name: '', ...(parsedRaw.value.Data.value as Record<string, any>).Player }))
      if (fsState.isReadonly) {
        forceCachedDataPaths[playerDatPath] = playerDat
      } else {
        await fs.promises.writeFile(playerDatPath, playerDat)
      }
    }

  }

  if (warnings.length && !disablePrompts) {
    const doContinue = confirm(`Continue with following warnings?\n${warnings.join('\n')}`)
    if (!doContinue) return
  }

  if (PROPOSE_BACKUP) {
    // TODO-HIGH! enable after copyFile in browserfs is implemented

    // const doBackup = options.alwaysBackupWorldBeforeLoading ?? confirm('Do you want to backup your world files before loading it?')
    // // const doBackup = true
    // if (doBackup) {
    //   // todo do it in flying squid instead
    //   await fs.promises.copyFile('/world/level.dat', `/world/level.dat_old`)
    //   try {
    //     await fs.promises.mkdir('/backups/region.old', { recursive: true })
    //   } catch (err) { }
    //   const files = await fs.promises.readdir('/world/region')
    //   for (const file of files) {
    //     await fs.promises.copyFile(`/world/region/${file}`, `/world/region.old/${file}`)
    //   }
    // }
  }

  if (!fsState.isReadonly) {
    // todo allow also to ctrl+s
    alert('Note: the world is saved only on /save or disconnect! ENSURE YOU HAVE BACKUP!')
  }

  fsState.saveLoaded = true
  document.querySelector('#title-screen').dispatchEvent(new CustomEvent('singleplayer', {
    // todo check gamemode level.dat data etc
    detail: {
      version,
      ...isFlat ? {
        generation: {
          name: 'superflat'
        }
      } : {},
      ...root === '/world' ? {} : {
        'worldFolder': root
      }
    },
  }))
}
