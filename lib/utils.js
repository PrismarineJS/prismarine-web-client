export const pointerLock = {
  get hasPointerLock() {
    return document.pointerLockElement || document['mozPointerLockElement'] || document['webkitPointerLockElement']
  }
}
