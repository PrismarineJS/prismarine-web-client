function cleanupBlockName (name) {
  if (name.startsWith('block') || name.startsWith('minecraft:block')) return name.split('/')[1]
  return name
}

function getModel (name, blocksModels) {
  name = cleanupBlockName(name)
  const data = blocksModels[name]
  if (!data) {
    return null
  }

  let model = { textures: {}, elements: [], ao: true }

  for (const axis in ['x', 'y', 'z']) {
    if (axis in data) {
      model[axis] = data[axis]
    }
  }

  if (data.parent) {
    model = getModel(data.parent, blocksModels)
  }
  if (data.textures) {
    Object.assign(model.textures, JSON.parse(JSON.stringify(data.textures)))
  }
  if (data.elements) {
    model.elements = JSON.parse(JSON.stringify(data.elements))
  }
  if (data.ambientocclusion !== undefined) {
    model.ao = data.ambientocclusion
  }
  return model
}

function prepareModel (model, texturesJson) {
  for (const tex in model.textures) {
    let root = model.textures[tex]
    while (root.charAt(0) === '#') {
      root = model.textures[root.substr(1)]
    }
    model.textures[tex] = root
  }
  for (const tex in model.textures) {
    let name = model.textures[tex]
    name = cleanupBlockName(name)
    model.textures[tex] = texturesJson[name]
  }
  for (const elem of model.elements) {
    for (const sideName of Object.keys(elem.faces)) {
      const face = elem.faces[sideName]

      if (face.texture.charAt(0) === '#') {
        face.texture = JSON.parse(JSON.stringify(model.textures[face.texture.substr(1)]))
      } else {
        let name = face.texture
        name = cleanupBlockName(name)
        face.texture = JSON.parse(JSON.stringify(texturesJson[name]))
      }

      let uv = face.uv
      if (!uv) {
        const _from = elem.from
        const _to = elem.to

        // taken from https://github.com/DragonDev1906/Minecraft-Overviewer/
        uv = {
          north: [_to[0], 16 - _to[1], _from[0], 16 - _from[1]],
          east: [_from[2], 16 - _to[1], _to[2], 16 - _from[1]],
          south: [_from[0], 16 - _to[1], _to[0], 16 - _from[1]],
          west: [_from[2], 16 - _to[1], _to[2], 16 - _from[1]],
          up: [_from[0], _from[2], _to[0], _to[2]],
          down: [_to[0], _from[2], _from[0], _to[2]]
        }[sideName]
      }

      const su = (uv[2] - uv[0]) * face.texture.su / 16
      const sv = (uv[3] - uv[1]) * face.texture.sv / 16
      face.texture.bu = face.texture.u + 0.5 * face.texture.su
      face.texture.bv = face.texture.v + 0.5 * face.texture.sv
      face.texture.u += uv[0] * face.texture.su / 16
      face.texture.v += uv[1] * face.texture.sv / 16
      face.texture.su = su
      face.texture.sv = sv
    }
  }
}

function resolveModel (name, blocksModels, texturesJson) {
  const model = getModel(name, blocksModels)
  prepareModel(model, texturesJson.textures)
  return model
}

function prepareBlocksStates (mcAssets, atlas) {
  const blocksStates = mcAssets.blocksStates
  for (const block of Object.values(blocksStates)) {
    if (!block) continue
    if (block.variants) {
      for (const variant of Object.values(block.variants)) {
        if (variant instanceof Array) {
          for (const v of variant) {
            v.model = resolveModel(v.model, mcAssets.blocksModels, atlas.json)
          }
        } else {
          variant.model = resolveModel(variant.model, mcAssets.blocksModels, atlas.json)
        }
      }
    }
    if (block.multipart) {
      for (const variant of block.multipart) {
        if (variant.apply instanceof Array) {
          for (const v of variant.apply) {
            v.model = resolveModel(v.model, mcAssets.blocksModels, atlas.json)
          }
        } else {
          variant.apply.model = resolveModel(variant.apply.model, mcAssets.blocksModels, atlas.json)
        }
      }
    }
  }
  return blocksStates
}

module.exports = { prepareBlocksStates }
