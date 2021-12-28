/**
 * Map, but instead of an array you just give a number
 * @param {number} j
 * @param {*} cb
 * @param {number} start optional start
 */
function repeat (j, cb, start = 0) {
  const arr = []
  for (let i = start; i < j; i++) {
    arr.push(cb(i))
  }
  return arr
}

module.exports = { repeat }
