// @ts-check
const path = require('path')
const dataPath = path.join(require.resolve('minecraft-data'), '../data.js')

const fs = require('fs')

const lines = fs.readFileSync(dataPath, 'utf8').split('\n')
if (lines[0] === '//patched') {
  console.log('Already patched')
  process.exit(0)
}

function removeLinesBetween (start, end) {
  const startIndex = lines.findIndex(line => line === start)
  if (startIndex === -1) return
  const endIndex = startIndex + lines.slice(startIndex).findIndex(line => line === end)
  // insert block comments
  lines.splice(startIndex, 0, '/*')
  lines.splice(endIndex + 2, 0, '*/')
}

removeLinesBetween("  'bedrock': {", '  }')

lines.unshift('//patched')
fs.writeFileSync(dataPath, lines.join('\n'), 'utf8')
