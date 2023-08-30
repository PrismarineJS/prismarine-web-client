import fs from 'fs'
import { supportedVersions } from 'space-squid/src/lib/version'
import * as nbt from 'prismarine-nbt'
import { promisify } from 'util'
import { options } from './optionsStorage'
import { proxy } from 'valtio'
import { nameToMcOfflineUUID } from './utils'
import { forceCachedDataPaths } from './browserfs'
import { gzip } from 'node-gzip'

const parseNbt = promisify(nbt.parse)

// additional fs metadata
export const fsState = proxy({
  isReadonly: false,
  syncFs: false,
})

const PROPOSE_BACKUP = true

export const loadFolder = async (root = '/world') => {
  // todo do it in singleplayer as well
  for (const key in forceCachedDataPaths) {
    delete forceCachedDataPaths[key]
  }

  const warnings: string[] = []
  let levelDatContent
  try {
    // todo-low cache reading
    levelDatContent = await fs.promises.readFile(`${root}/level.dat`)
  } catch (err) {
    if (err.code === 'ENOENT') {
      if (!fsState.isReadonly) {
        warnings.push('level.dat not found, world in current folder will be created')
      } else {
        throw new Error('level.dat not found, ensure you are loading world folder')
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

    version = levelDat.Version?.Name
    if (!version) {
      const newVersion = prompt(`In 1.8 and before world save doesn\'t contain version info, please enter version you want to use to load the world.\nSupported versions ${supportedVersions.join(', ')}`, '1.8.8')
      if (!newVersion) return
      version = newVersion
    }
    if (!supportedVersions.includes(version)) {
      warnings.push(`Version ${version} is not supported, supported versions ${supportedVersions.join(', ')}, 1.16.1 will be used`)
      version = '1.16.1'
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
    if (!isFlat) {
      warnings.push(`Generator ${levelDat.generatorName} is not supported yet`)
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

  if (warnings.length) {
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
    alert("Note: the world is saved only when you click disconnect!")
  }

  document.querySelector('#title-screen').dispatchEvent(new CustomEvent('singleplayer', {
    // todo check gamemode level.dat data etc
    detail: {
      version,
      ...isFlat ? {
        generation: {
          name: 'superflat'
        }
      } : {},
      ...root !== '/world' ? {
        'worldFolder': root
      } : {}
    },
  }))
}
