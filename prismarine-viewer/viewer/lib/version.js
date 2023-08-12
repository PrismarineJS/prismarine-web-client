const supportedVersions = require('../../public/supportedVersions.json')

const lastOfMajor = {}
for (const version of supportedVersions) {
  const major = toMajor(version)
  if (lastOfMajor[major]) {
    if (minor(lastOfMajor[major]) < minor(version)) {
      lastOfMajor[major] = version
    }
  } else {
    lastOfMajor[major] = version
  }
}

function toMajor (version) {
  const [a, b] = (version + '').split('.')
  return a + '.' + b
}

function minor (version) {
  const [, , c] = (version + '.0').split('.')
  return parseInt(c, 10)
}

function getVersion (version) {
  if (supportedVersions.indexOf(version) !== -1) return version
  return lastOfMajor[toMajor(version)]
}

module.exports = { getVersion }
