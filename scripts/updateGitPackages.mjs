// pnpm bug workaround
import fs from 'fs'
import { parse } from 'yaml'

const lockfile = parse(fs.readFileSync('./pnpm-lock.yaml', 'utf8'))

const depsKeys = ['dependencies', 'devDependencies']

for (const importer of Object.values(lockfile.importers)) {
  for (const depsKey of depsKeys) {
    for (const [depName, { specifier, version }] of Object.entries(importer[depsKey])) {
      if (!specifier.startsWith('github:')) continue
      let branch = specifier.match(/#(.*)$/)?.[1] ?? ''
      if (branch) branch = `/${branch}`
      const sha = version.split('/').slice(3).join('/').replace(/\(.+/, '')
      const repo = version.split('/').slice(1, 3).join('/')
      const lastCommitJson = await fetch(`https://api.github.com/repos/${repo}/commits${branch}?per_page=1`).then(res => res.json())
      const lastCommitActual = lastCommitJson ?? lastCommitJson[0]
      const lastCommitActualSha = lastCommitActual?.sha
      if (lastCommitActualSha === undefined) debugger
      if (sha !== lastCommitActualSha) {
        console.log(`Outdated ${depName} github.com/${repo} : ${sha} -> ${lastCommitActualSha} (${lastCommitActual.commit.message})`)
      }
    }
  }
}
