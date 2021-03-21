let assetsDir = '';

export default class ResourceLocation {
  constructor(resourceName) {
    this.namespace = decompose(resourceName, ':')[0];
    this.path = decompose(resourceName, ':')[1];
  }

  getPath() {
    return this.path;
  }

  getNamespace() {
    return this.namespace;
  }

  getFullPath() {
    return `${assetsDir}${this.namespace}/${this.path}`;
  }

  toString() {
    return this.namespace + ':' + this.path;
  }
}

export function setAssetsDir(dir) {
  assetsDir = dir;
}

export function decompose(resourceName, splitOn) {
  let astring = ['minecraft', resourceName];
  let i = resourceName.indexOf(splitOn);
  if(i > -1) {
    astring[1] = resourceName.substring(i + 1, resourceName.length);
    if(i >= 1) astring[0] = resourceName.substring(0, i);
  }

  return astring;
}