const THREE = require('three')
const { MeshLine, MeshLineMaterial } = require('three.meshline')
const { dispose3 } = require('./dispose')

function getMesh (primitive, camera) {
  if (primitive.type === 'line') {
    const color = primitive.color ? primitive.color : 0xff0000
    const resolution = new THREE.Vector2(window.innerWidth / camera.zoom, window.innerHeight / camera.zoom)
    const material = new MeshLineMaterial({ color, resolution, sizeAttenuation: false, lineWidth: 8 })

    const points = []
    for (const p of primitive.points) {
      points.push(p.x, p.y, p.z)
    }

    const line = new MeshLine()
    line.setPoints(points)
    return new THREE.Mesh(line, material)
  } else if (primitive.type === 'boxgrid') {
    const color = primitive.color ? primitive.color : 'aqua'

    const sx = primitive.end.x - primitive.start.x
    const sy = primitive.end.y - primitive.start.y
    const sz = primitive.end.z - primitive.start.z

    const boxGeometry = new THREE.BoxBufferGeometry(sx, sy, sz, sx, sy, sz)
    boxGeometry.attributes.positionStart = boxGeometry.attributes.position.clone()

    const gridGeometry = GridBoxGeometry(boxGeometry, false)
    const grid = new THREE.LineSegments(gridGeometry, new THREE.LineBasicMaterial({ color }))
    grid.position.x = primitive.start.x + sx / 2
    grid.position.y = primitive.start.y + sy / 2
    grid.position.z = primitive.start.z + sz / 2
    return grid
  } else if (primitive.type === 'points') {
    const color = primitive.color ? primitive.color : 'aqua'
    const size = primitive.size ? primitive.size : 5
    const points = []
    for (const p of primitive.points) {
      points.push(p.x, p.y, p.z)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
    const material = new THREE.PointsMaterial({ color, size, sizeAttenuation: false })
    return new THREE.Points(geometry, material)
  }
  return null
}

class Primitives {
  constructor (scene, camera) {
    this.scene = scene
    this.camera = camera
    this.primitives = {}
  }

  clear () {
    for (const mesh of Object.values(this.primitives)) {
      this.scene.remove(mesh)
      dispose3(mesh)
    }
    this.primitives = {}
  }

  update (primitive) {
    if (this.primitives[primitive.id]) {
      this.scene.remove(this.primitives[primitive.id])
      dispose3(this.primitives[primitive.id])
      delete this.primitives[primitive.id]
    }

    const mesh = getMesh(primitive, this.camera)
    if (!mesh) return
    this.primitives[primitive.id] = mesh
    this.scene.add(mesh)
  }
}

function GridBoxGeometry (geometry, independent) {
  if (!(geometry instanceof THREE.BoxBufferGeometry)) {
    console.log("GridBoxGeometry: the parameter 'geometry' has to be of the type THREE.BoxBufferGeometry")
    return geometry
  }
  independent = independent !== undefined ? independent : false

  const newGeometry = new THREE.BoxBufferGeometry()
  const position = geometry.attributes.position
  newGeometry.attributes.position = independent === false ? position : position.clone()

  const segmentsX = geometry.parameters.widthSegments || 1
  const segmentsY = geometry.parameters.heightSegments || 1
  const segmentsZ = geometry.parameters.depthSegments || 1

  let startIndex = 0
  const indexSide1 = indexSide(segmentsZ, segmentsY, startIndex)
  startIndex += (segmentsZ + 1) * (segmentsY + 1)
  const indexSide2 = indexSide(segmentsZ, segmentsY, startIndex)
  startIndex += (segmentsZ + 1) * (segmentsY + 1)
  const indexSide3 = indexSide(segmentsX, segmentsZ, startIndex)
  startIndex += (segmentsX + 1) * (segmentsZ + 1)
  const indexSide4 = indexSide(segmentsX, segmentsZ, startIndex)
  startIndex += (segmentsX + 1) * (segmentsZ + 1)
  const indexSide5 = indexSide(segmentsX, segmentsY, startIndex)
  startIndex += (segmentsX + 1) * (segmentsY + 1)
  const indexSide6 = indexSide(segmentsX, segmentsY, startIndex)

  let fullIndices = []
  fullIndices = fullIndices.concat(indexSide1)
  fullIndices = fullIndices.concat(indexSide2)
  fullIndices = fullIndices.concat(indexSide3)
  fullIndices = fullIndices.concat(indexSide4)
  fullIndices = fullIndices.concat(indexSide5)
  fullIndices = fullIndices.concat(indexSide6)

  newGeometry.setIndex(fullIndices)

  function indexSide (x, y, shift) {
    const indices = []
    for (let i = 0; i < y + 1; i++) {
      let index11 = 0
      let index12 = 0
      for (let j = 0; j < x; j++) {
        index11 = (x + 1) * i + j
        index12 = index11 + 1
        const index21 = index11
        const index22 = index11 + (x + 1)
        indices.push(shift + index11, shift + index12)
        if (index22 < ((x + 1) * (y + 1) - 1)) {
          indices.push(shift + index21, shift + index22)
        }
      }
      if ((index12 + x + 1) <= ((x + 1) * (y + 1) - 1)) {
        indices.push(shift + index12, shift + index12 + x + 1)
      }
    }
    return indices
  }
  return newGeometry
}

module.exports = { Primitives }
