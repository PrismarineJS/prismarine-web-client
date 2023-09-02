//@ts-check
import { build } from 'esbuild'
import Module from "node:module"
import { dirname } from 'node:path'

const require = Module.createRequire(import.meta.url)

const dataPaths = require('minecraft-data/minecraft-data/data/dataPaths.json')

function toMajor (version) {
  const [a, b] = (version + '').split('.')
  return `${a}.${b}`
}

const ignoredVersionsRegex = /(^0\.30c$)|w|-pre|-rc/

const grouped = {}

for (const [version, data] of Object.entries(dataPaths.pc)) {
  if (ignoredVersionsRegex.test(version)) continue
  const major = toMajor(version)
  grouped[major] ??= {}
  grouped[major][version] = data
}

console.log('preparing data')
for (const [major, versions] of Object.entries(grouped)) {
  let contents = 'Object.assign(window.mcData, {\n'
  for (const [version, dataSet] of Object.entries(versions)) {
    contents += `    '${version}': {\n`
    for (const [dataType, dataPath] of Object.entries(dataSet)) {
      const loc = `minecraft-data/data/${dataPath}/`
      contents += `      get ${dataType} () { return require("./${loc}${dataType}.json") },\n`
    }
    contents += '    },\n'
  }
  contents += '})'

  await build({
    bundle: true,
    outfile: `dist/mc-data/${major}.js`,
    stdin: {
      contents,

      resolveDir: dirname(require.resolve('minecraft-data')),
      sourcefile: `mcData${major}.js`,
      loader: 'js',
    },
  })
}
console.log('data prepared')
