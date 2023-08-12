/* eslint-disable */
// Similar to THREE MapControls with more Minecraft-like
// controls.
// Defaults:
// Shift = Move Down, Space = Move Up
// W/Z - north, S - south, A/Q - west, D - east

const STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}

class MapControls {
  constructor(camera, domElement) {
    this.enabled = true
    this.object = camera
    this.element = domElement

    // Mouse buttons
    this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }

    // Touch fingers
    this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }

    this.controlMap = {
      MOVE_FORWARD: ['KeyW', 'KeyZ'],
      MOVE_BACKWARD: 'KeyS',
      MOVE_LEFT: ['KeyA', 'KeyQ'],
      MOVE_RIGHT: 'KeyD',
      MOVE_DOWN: 'ShiftLeft',
      MOVE_UP: 'Space'
    }

    this.target = new THREE.Vector3()

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0
    this.maxDistance = Infinity

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0
    this.maxZoom = Infinity

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0 // radians
    this.maxPolarAngle = Math.PI // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = -Infinity // radians
    this.maxAzimuthAngle = Infinity // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false
    this.dampingFactor = 0.01

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = true
    this.enableTouchZoom = true
    this.zoomSpeed = 1.0

    // Set to false to disable rotating
    this.enableRotate = true
    this.enableTouchRotate = true
    this.rotateSpeed = 1.0

    // Set to false to disable panning
    this.enablePan = true
    this.enableTouchPan = true
    this.panSpeed = 1.0
    this.screenSpacePanning = false // if false, pan orthogonal to world-space direction camera.up
    this.keyPanDistance = 32 // how far to pan
    this.keyPanSpeed = 10	// pixels moved per arrow key push
    this.verticalTranslationSpeed = 0.5 // how much Y increments moving up/down

    this.keyDowns = []

    // State-related stuff

    this.changeEvent = { type: 'change' }
    this.startEvent = { type: 'start' }
    this.endEvent = { type: 'end' }

    this.state = STATE.NONE

    this.EPS = 0.000001

    this.spherical = new THREE.Spherical()
    this.sphericalDelta = new THREE.Spherical()

    this.scale = 1
    this.panOffset = new THREE.Vector3()
    this.zoomChanged = false

    this.rotateStart = new THREE.Vector2()
    this.rotateEnd = new THREE.Vector2()
    this.rotateDelta = new THREE.Vector2()

    this.panStart = new THREE.Vector2()
    this.panEnd = new THREE.Vector2()
    this.panDelta = new THREE.Vector2()

    this.dollyStart = new THREE.Vector2()
    this.dollyEnd = new THREE.Vector2()
    this.dollyDelta = new THREE.Vector2()

    // for reset
    this.target0 = this.target.clone()
    this.position0 = this.object.position.clone()
    this.zoom0 = this.object.zoom

    this.ticks = 0

    // register event handlers
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onMouseWheel = this.onMouseWheel.bind(this)
    
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)

    this.onContextMenu = this.onContextMenu.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)

    this.registerHandlers()
  }

  //#region Public Methods
  setRotationOrigin(position) {
    this.target = position.clone()
  }

  unsetRotationOrigin() {
    this.target = new THREE.Vector3()
  }

  getPolarAngle() {
    return this.spherical.phi
  }

  getAzimuthalAngle() {
    return this.spherical.theta
  }

  saveState() {
    this.target0.copy(this.target)
    this.position0.copy(this.object.position)
    this.zoom0 = this.object.zoom
  }

  reset() {
    this.target.copy(this.target0)
    this.object.position.copy(this.position0)
    this.object.zoom = this.zoom0

    this.object.updateProjectionMatrix()
    this.dispatchEvent(this.changeEvent)

    this.update(true)

    this.state = STATE.NONE
  }

  // this method is exposed, but perhaps it would be better if we can make it private...
  update(force) {
    // tick controls if called from render loop
    if (!force) {
      this.tickControls()
    }

    var offset = new THREE.Vector3()

    // so camera.up is the orbit axis
    var quat = new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0, 1, 0))
    var quatInverse = quat.clone().invert()

    var lastPosition = new THREE.Vector3()
    var lastQuaternion = new THREE.Quaternion()

    var twoPI = 2 * Math.PI

    var position = this.object.position
    offset.copy(position).sub(this.target)

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion(quat)

    // angle from z-axis around y-axis
    this.spherical.setFromVector3(offset)

    if (this.autoRotate && this.state === STATE.NONE) {
      this.rotateLeft(this.getAutoRotationAngle())
    }

    if (this.enableDamping) {
      this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor
      this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor
    } else {
      this.spherical.theta += this.sphericalDelta.theta
      this.spherical.phi += this.sphericalDelta.phi
    }

    // restrict theta to be between desired limits
    var min = this.minAzimuthAngle
    var max = this.maxAzimuthAngle

    if (isFinite(min) && isFinite(max)) {
      if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI
      if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI
      if (min < max) {
        this.spherical.theta = Math.max(min, Math.min(max, this.spherical.theta))
      } else {
        this.spherical.theta = (this.spherical.theta > (min + max) / 2) ?
          Math.max(min, this.spherical.theta) :
          Math.min(max, this.spherical.theta)
      }
    }

    // restrict phi to be between desired limits
    this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi))
    this.spherical.makeSafe()
    this.spherical.radius *= this.scale

    // restrict radius to be between desired limits
    this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius))

    // move target to panned location
    if (this.enableDamping === true) {
      this.target.addScaledVector(this.panOffset, this.dampingFactor)
    } else {
      this.target.add(this.panOffset)
    }

    offset.setFromSpherical(this.spherical)

    // rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion(quatInverse)

    position.copy(this.target).add(offset)

    this.object.lookAt(this.target)

    if (this.enableDamping === true) {
      this.sphericalDelta.theta *= (1 - this.dampingFactor)
      this.sphericalDelta.phi *= (1 - this.dampingFactor)
      this.panOffset.multiplyScalar(1 - this.dampingFactor)
    } else {
      this.sphericalDelta.set(0, 0, 0)
      this.panOffset.set(0, 0, 0)
    }

    this.scale = 1

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (this.zoomChanged ||
      lastPosition.distanceToSquared(this.object.position) > this.EPS ||
      8 * (1 - lastQuaternion.dot(this.object.quaternion)) > this.EPS) {

      this.dispatchEvent(this.changeEvent)

      lastPosition.copy(this.object.position)
      lastQuaternion.copy(this.object.quaternion)
      this.zoomChanged = false

      return true
    }

    return false
  }

  //#endregion

  //#region Orbit Controls 
  getAutoRotationAngle() {
    return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed
  }

  getZoomScale() {
    return Math.pow(0.95, this.zoomSpeed)
  }

  rotateLeft(angle) {
    this.sphericalDelta.theta -= angle
  }

  rotateUp(angle) {
    this.sphericalDelta.phi -= angle
  }

  panLeft(distance, objectMatrix) {
    let v = new THREE.Vector3()

    v.setFromMatrixColumn(objectMatrix, 0) // get X column of objectMatrix
    v.multiplyScalar(- distance)

    this.panOffset.add(v)
  }

  panUp(distance, objectMatrix) {
    let v = new THREE.Vector3()

    if (this.screenSpacePanning === true) {
      v.setFromMatrixColumn(objectMatrix, 1)
    } else {
      v.setFromMatrixColumn(objectMatrix, 0)
      v.crossVectors(this.object.up, v)
    }

    v.multiplyScalar(distance)

    this.panOffset.add(v)
  }

  // Patch - translate Y
  translateY(delta) {
    this.panOffset.y += delta
  }

  // deltaX and deltaY are in pixels; right and down are positive
  pan(deltaX, deltaY, distance) {
    let offset = new THREE.Vector3()

    if (this.object.isPerspectiveCamera) {
      // perspective
      var position = this.object.position
      offset.copy(position).sub(this.target)
      var targetDistance = offset.length()

      // half of the fov is center to top of screen
      targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180.0)
      targetDistance = distance || targetDistance

      // we use only clientHeight here so aspect ratio does not distort speed
      this.panLeft(2 * deltaX * targetDistance / this.element.clientHeight, this.object.matrix)
      this.panUp(2 * deltaY * targetDistance / this.element.clientHeight, this.object.matrix)
    } else if (this.object.isOrthographicCamera) {
      // orthographic
      this.panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / this.element.clientWidth, this.object.matrix)
      this.panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / this.element.clientHeight, this.object.matrix)
    } else {
      // camera neither orthographic nor perspective
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.')
      this.enablePan = false
    }
  }

  dollyOut(dollyScale) {
    if (this.object.isPerspectiveCamera) {
      this.scale /= dollyScale
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale))
      this.object.updateProjectionMatrix()
      this.zoomChanged = true
    } else {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
      this.enableZoom = false
    }
  }

  dollyIn(dollyScale) {
    if (this.object.isPerspectiveCamera) {
      this.scale *= dollyScale
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale))
      this.object.updateProjectionMatrix()
      this.zoomChanged = true
    } else {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
      this.enableZoom = false
    }
  }
  //#endregion

  //#region Event Callbacks - update the object state

  handleMouseDownRotate(event) {
    this.rotateStart.set(event.clientX, event.clientY)

  }

  handleMouseDownDolly(event) {
    this.dollyStart.set(event.clientX, event.clientY)

  }

  handleMouseDownPan(event) {
    this.panStart.set(event.clientX, event.clientY)
  }

  handleMouseMoveRotate(event) {
    this.rotateEnd.set(event.clientX, event.clientY)

    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)

    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.element.clientHeight) // yes, height
    this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.element.clientHeight)

    this.rotateStart.copy(this.rotateEnd)

    this.update(true)
  }

  handleMouseMoveDolly(event) {
    this.dollyEnd.set(event.clientX, event.clientY)
    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart)

    if (this.dollyDelta.y > 0) {
      this.dollyOut(this.getZoomScale())
    } else if (this.dollyDelta.y < 0) {
      this.dollyIn(this.getZoomScale())
    }
    this.dollyStart.copy(this.dollyEnd)
    this.update(true)
  }

  handleMouseMovePan(event) {
    this.panEnd.set(event.clientX, event.clientY)
    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)
    this.pan(this.panDelta.x, this.panDelta.y)

    this.panStart.copy(this.panEnd)

    this.update(true)
  }

  handleMouseUp(/*event*/) {
    // no-op
  }

  handleMouseWheel(event) {
    if (event.deltaY < 0) {
      this.dollyIn(this.getZoomScale())
    } else if (event.deltaY > 0) {
      this.dollyOut(this.getZoomScale())
    }

    this.update(true)
  }

  //#endregion

  //#region Mouse/Keyboard handlers

  // Called when the cursor location has moved
  onPointerMove(event) {
    if (!this.enabled || (this.state == STATE.NONE)) return

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseMove(event)
        break
      // TODO touch
    }
  }

  // Called when the cursor is no longer behind held
  onPointerUp(event) {
    if (!this.enabled) return
    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseUp(event)
        break
      // TODO touch
    }
  }

  // On left click or tap
  onPointerDown(event) {
    if (!this.enabled) return

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseDown(event)
        break
      // TODO touch
    }
  }

  onMouseDown(event) {
    // Prevent the browser from scrolling.
    event.preventDefault()

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.
    this.element.focus ? this.element.focus() : window.focus()

    var mouseAction

    switch (event.button) {
      case 0:
        mouseAction = this.mouseButtons.LEFT
        break
      case 1:
        mouseAction = this.mouseButtons.MIDDLE
        break
      case 2:
        mouseAction = this.mouseButtons.RIGHT
        break
      default:
        mouseAction = - 1
    }

    switch (mouseAction) {
      case THREE.MOUSE.DOLLY:
        if (this.enableZoom === false) return
        this.handleMouseDownDolly(event)
        this.state = STATE.DOLLY
        break
      case THREE.MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enablePan === false) return
          this.handleMouseDownPan(event)
          this.state = STATE.PAN
        } else {
          if (this.enableRotate === false) return
          this.handleMouseDownRotate(event)
          this.state = STATE.ROTATE
        }
        break
      case THREE.MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate === false) return
          this.handleMouseDownRotate(event)
          this.state = STATE.ROTATE
        } else {
          if (this.enablePan === false) return
          this.handleMouseDownPan(event)
          this.state = STATE.PAN
        }
        break
      default:
        this.state = STATE.NONE

    }

  }

  onMouseMove(event) {
    if (this.enabled === false) return

    event.preventDefault()

    switch (this.state) {
      case STATE.ROTATE:
        if (this.enableRotate === false) return
        this.handleMouseMoveRotate(event)
        break
      case STATE.DOLLY:
        if (this.enableZoom === false) return
        this.handleMouseMoveDolly(event)
        break
      case STATE.PAN:
        if (this.enablePan === false) return
        this.handleMouseMovePan(event)
        break
    }
  }

  onMouseUp(event) {
    this.state = STATE.NONE
  }

  onMouseWheel(event) {
    if (this.enabled === false || this.enableZoom === false || (this.state !== STATE.NONE && this.state !== STATE.ROTATE)) return
    event.preventDefault()
    event.stopPropagation()
    this.dispatchEvent(this.startEvent)
    this.handleMouseWheel(event)
    this.dispatchEvent(this.endEvent)
  }

  //#endregion


  //#region Touch handlers
  handleTouchStartRotate(event) {

    if (event.touches.length == 1) {

      this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY)

    } else {

      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.rotateStart.set(x, y)

    }

  }

  handleTouchStartPan(event) {

    if (event.touches.length == 1) {

      this.panStart.set(event.touches[0].pageX, event.touches[0].pageY)

    } else {

      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.panStart.set(x, y)

    }

  }

  handleTouchStartDolly(event) {

    var dx = event.touches[0].pageX - event.touches[1].pageX
    var dy = event.touches[0].pageY - event.touches[1].pageY

    var distance = Math.sqrt(dx * dx + dy * dy)

    this.dollyStart.set(0, distance)

  }

  handleTouchStartDollyPan(event) {
    if (this.enableTouchZoom) this.handleTouchStartDolly(event)
    if (this.enableTouchPan) this.handleTouchStartPan(event)
  }

  handleTouchStartDollyRotate(event) {
    if (this.enableTouchZoom) this.handleTouchStartDolly(event)
    if (this.enableTouchRotate) this.handleTouchStartRotate(event)

  }

  handleTouchMoveRotate(event) {
    if (event.touches.length == 1) {
      this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.rotateEnd.set(x, y)
    }

    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)

    this.rotateLeft(2 * Math.PI * this.rotateDelta.x / this.element.clientHeight) // yes, height

    this.rotateUp(2 * Math.PI * this.rotateDelta.y / this.element.clientHeight)

    this.rotateStart.copy(this.rotateEnd)

  }

  handleTouchMovePan(event) {

    if (event.touches.length == 1) {
      this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY)

    } else {

      var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.panEnd.set(x, y)

    }

    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)

    this.pan(this.panDelta.x, this.panDelta.y)

    this.panStart.copy(this.panEnd)

  }

  handleTouchMoveDolly(event) {

    var dx = event.touches[0].pageX - event.touches[1].pageX
    var dy = event.touches[0].pageY - event.touches[1].pageY

    var distance = Math.sqrt(dx * dx + dy * dy)

    this.dollyEnd.set(0, distance)

    this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed))

    this.dollyOut(this.dollyDelta.y)

    this.dollyStart.copy(this.dollyEnd)

  }

  handleTouchMoveDollyPan(event) {

    if (this.enableTouchZoom) this.handleTouchMoveDolly(event)

    if (this.enableTouchPan) this.handleTouchMovePan(event)

  }

  handleTouchMoveDollyRotate(event) {

    if (this.enableTouchZoom) this.handleTouchMoveDolly(event)

    if (this.enableTouchRotate) this.handleTouchMoveRotate(event)

  }

  handleTouchEnd( /*event*/) {

    // no-op

  }

  //#endregion

  tickControls() {
    const control = this.controlMap

    for (var keyCode of this.keyDowns) {
      if (control.MOVE_FORWARD.includes(keyCode)) {
        this.pan(0, this.keyPanSpeed, this.keyPanDistance)
      } else if (control.MOVE_BACKWARD.includes(keyCode)) {
        this.pan(0, -this.keyPanSpeed, this.keyPanDistance)
      } else if (control.MOVE_LEFT.includes(keyCode)) {
        this.pan(this.keyPanSpeed, 0, this.keyPanDistance)
      } else if (control.MOVE_RIGHT.includes(keyCode)) {
        this.pan(-this.keyPanSpeed, 0, this.keyPanDistance)
      } else if (control.MOVE_UP.includes(keyCode)) {
        this.translateY(+this.verticalTranslationSpeed)
      } else if (control.MOVE_DOWN.includes(keyCode)) {
        this.translateY(-this.verticalTranslationSpeed)
      }
    }
  }

  onKeyDown(e) {
    if (!this.enabled) return

    if (e.code && !this.keyDowns.includes(e.code)) {
      this.keyDowns.push(e.code)
      // console.debug('[control] Key down: ', this.keyDowns)
    }
  }

  onKeyUp(event) {
    // console.log('[control] Key up: ', event.code, this.keyDowns)
    this.keyDowns = this.keyDowns.filter(code => code != event.code)
  }

  onTouchStart(event) {
    if (this.enabled === false) return
    event.preventDefault() // prevent scrolling
    switch (event.touches.length) {
      case 1:
        switch (this.touches.ONE) {
          case THREE.TOUCH.ROTATE:
            if (this.enableTouchRotate === false) return
            this.handleTouchStartRotate(event)
            this.state = STATE.TOUCH_ROTATE
            break
          case THREE.TOUCH.PAN:
            if (this.enableTouchPan === false) return
            this.handleTouchStartPan(event)
            this.state = STATE.TOUCH_PAN
            break
          default:
            this.state = STATE.NONE
        }
        break
      case 2:
        switch (this.touches.TWO) {
          case THREE.TOUCH.DOLLY_PAN:
            if (this.enableTouchZoom === false && this.enableTouchPan === false) return
            this.handleTouchStartDollyPan(event)
            this.state = STATE.TOUCH_DOLLY_PAN
            break
          case THREE.TOUCH.DOLLY_ROTATE:
            if (this.enableTouchZoom === false && this.enableTouchRotate === false) return
            this.handleTouchStartDollyRotate(event)
            this.state = STATE.TOUCH_DOLLY_ROTATE
            break
          default:
            this.state = STATE.NONE
        }
        break
      default:
        this.state = STATE.NONE
    }
    if (this.state !== STATE.NONE) {
      this.dispatchEvent(this.startEvent)
    }
  }

  onTouchMove(event) {

    if (this.enabled === false) return

    event.preventDefault() // prevent scrolling
    event.stopPropagation()

    switch (this.state) {

      case STATE.TOUCH_ROTATE:

        if (this.enableTouchRotate === false) return

        this.handleTouchMoveRotate(event)

        this.update()

        break

      case STATE.TOUCH_PAN:

        if (this.enableTouchPan === false) return

        this.handleTouchMovePan(event)

        this.update()

        break

      case STATE.TOUCH_DOLLY_PAN:

        if (this.enableTouchZoom === false && this.enableTouchPan === false) return

        this.handleTouchMoveDollyPan(event)

        this.update()

        break

      case STATE.TOUCH_DOLLY_ROTATE:

        if (this.enableTouchZoom === false && this.enableTouchRotate === false) return

        this.handleTouchMoveDollyRotate(event)

        this.update()

        break

      default:

        this.state = STATE.NONE

    }

  }

  onTouchEnd(event) {

    if (this.enabled === false) return

    this.handleTouchEnd(event)

    this.dispatchEvent(this.endEvent)

    this.state = STATE.NONE

  }


  onContextMenu(event) {
    // Disable context menu
    if (this.enabled) event.preventDefault()
  }

  registerHandlers() {
    this.element.addEventListener('pointermove', this.onPointerMove, false, {passive: true})
    this.element.addEventListener('pointerup', this.onPointerUp, false, {passive: true})
    this.element.addEventListener('pointerdown', this.onPointerDown, false, {passive: true})
    this.element.addEventListener('wheel', this.onMouseWheel, true, {passive: true})

    this.element.addEventListener('touchstart', this.onTouchStart, false, {passive: true})
    this.element.addEventListener('touchend', this.onTouchEnd, false, {passive: true})
    this.element.addEventListener('touchmove', this.onTouchMove, false, {passive: true})

    this.element.ownerDocument.addEventListener('contextmenu', this.onContextMenu, false, {passive: true})
    this.element.ownerDocument.addEventListener('keydown', this.onKeyDown, false, {passive: true})
    this.element.ownerDocument.addEventListener('keyup', this.onKeyUp, false, {passive: true})
    console.log('[controls] registered handlers', this.element)
  }

  unregisterHandlers() {
    this.element.removeEventListener('pointermove', this.onPointerMove, false, {passive: true})
    this.element.removeEventListener('pointerup', this.onPointerUp, false, {passive: true})
    this.element.removeEventListener('pointerdown', this.onPointerDown, false, {passive: true})
    this.element.removeEventListener('wheel', this.onMouseWheel, true, {passive: true})

    this.element.removeEventListener('touchstart', this.onTouchStart, false, {passive: true})
    this.element.removeEventListener('touchend', this.onTouchEnd, false, {passive: true})
    this.element.removeEventListener('touchmove', this.onTouchMove, false, {passive: true})

    this.element.ownerDocument.removeEventListener('contextmenu', this.onContextMenu, false, {passive: true})
    this.element.ownerDocument.removeEventListener('keydown', this.onKeyDown, false, {passive: true})
    this.element.ownerDocument.removeEventListener('keyup', this.onKeyUp, false, {passive: true})
    console.log('[controls] unregistered handlers', this.element)
  }

  dispatchEvent() {
    // no-op
  }
}

module.exports = { MapControls }