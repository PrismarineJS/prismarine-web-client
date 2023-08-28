//@ts-check
const path = require('path')
const dataPath = path.join(require.resolve('minecraft-data'), '../data.js')

const fs = require('fs')

const lines = fs.readFileSync(dataPath, 'utf8').split('\n')
if (lines[0] === '//patched') {
  console.log('Already patched')
  process.exit(0)
}

function removeLinesBetween (start, end) {
  let startIndex = lines.findIndex(line => line === start)
  if (startIndex === -1) return
  let endIndex = startIndex + lines.slice(startIndex).findIndex(line => line === end)
  // insert block comments
  lines.splice(startIndex, 0, `/*`)
  lines.splice(endIndex + 2, 0, `*/`)
}

// todo removing bedrock support for now, will optiimze in future instead
removeLinesBetween("  'bedrock': {", '  }')

lines.unshift('//patched')
// fs.writeFileSync(path.join(dataPath, '../dataGlobal.js'), newContents, 'utf8')
fs.writeFileSync(dataPath, lines.join('\n'), 'utf8')
