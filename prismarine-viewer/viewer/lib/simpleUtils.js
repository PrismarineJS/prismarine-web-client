function getBufferFromStream (stream) {
  return new Promise(
    (resolve, reject) => {
      let buffer = Buffer.from([])
      stream.on('data', buf => {
        buffer = Buffer.concat([buffer, buf])
      })
      stream.on('end', () => resolve(buffer))
      stream.on('error', reject)
    }
  )
}

function spiral (X, Y, fun) { // TODO: move that to spiralloop package
  let x = 0
  let y = 0
  let dx = 0
  let dy = -1
  const N = Math.max(X, Y) * Math.max(X, Y)
  const hX = X / 2
  const hY = Y / 2
  for (let i = 0; i < N; i++) {
    if (-hX < x && x <= hX && -hY < y && y <= hY) {
      fun(x, y)
    }
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      const tmp = dx
      dx = -dy
      dy = tmp
    }
    x += dx
    y += dy
  }
}

class ViewRect {
  constructor (cx, cz, viewDistance) {
    this.x0 = cx - viewDistance
    this.x1 = cx + viewDistance
    this.z0 = cz - viewDistance
    this.z1 = cz + viewDistance
  }

  contains (x, z) {
    return this.x0 < x && x <= this.x1 && this.z0 < z && z <= this.z1
  }
}

function chunkPos (pos) {
  const x = Math.floor(pos.x / 16)
  const z = Math.floor(pos.z / 16)
  return [x, z]
}

module.exports = { getBufferFromStream, spiral, ViewRect, chunkPos }
