/* global THREE */

const { VRButton } = require('three/examples/jsm/webxr/VRButton.js')
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js')
const { XRControllerModelFactory } = require('three/examples/jsm/webxr/XRControllerModelFactory.js')
const TWEEN = require('@tweenjs/tween.js')

async function initVR (bot, renderer, viewer) {
  if (!('xr' in navigator)) return

  const supported = await navigator.xr.isSessionSupported( 'immersive-vr' )
  if (!supported) return

  // VR
  document.body.appendChild(VRButton.createButton(renderer))
  renderer.xr.enabled = true

  // hack for vr camera
  const user = new THREE.Group()
  user.add(viewer.camera)
  viewer.scene.add(user)
  const controllerModelFactory = new XRControllerModelFactory(new GLTFLoader())
  const controller1 = renderer.xr.getControllerGrip(0)
  const controller2 = renderer.xr.getControllerGrip(1)
  let hand1 = controllerModelFactory.createControllerModel(controller1)
  controller1.addEventListener('connected', (event) => {
    hand1.xrInputSource = event.data
    user.add(controller1)
  })
  controller1.add(hand1)
  let hand2 = controllerModelFactory.createControllerModel(controller2)
  controller2.addEventListener('connected', (event) => {
    hand2.xrInputSource = event.data
    user.add(controller2)
  })
  controller2.add(hand2)

  viewer.setFirstPersonCamera = function (pos, yaw, pitch) {
    if (pos) new TWEEN.Tween(user.position).to({ x: pos.x, y: pos.y, z: pos.z }, 50).start()
    user.rotation.set(pitch, yaw, 0, 'ZYX')
  }

  let rotSnapReset = true
  let yawOffset = 0
  renderer.setAnimationLoop(() => {
    if (hand1.xrInputSource && hand2.xrInputSource) {
      hand1.xAxis = hand1.xrInputSource.gamepad.axes[2]
      hand1.yAxis = hand1.xrInputSource.gamepad.axes[3]
      hand2.xAxis = hand2.xrInputSource.gamepad.axes[2]
      hand2.yAxis = hand2.xrInputSource.gamepad.axes[3]
      if (hand1.xrInputSource.handedness === 'right') {
        const tmp = hand2
        hand2 = hand1
        hand1 = tmp
      }
    }

    if (rotSnapReset) {
      if (Math.abs(hand1.xAxis) > 0.8) {
        yawOffset -= Math.PI / 4 * Math.sign(hand1.xAxis)
        rotSnapReset = false
      }
    } else if (Math.abs(hand1.xAxis) < 0.1) {
      rotSnapReset = true
    }

    viewer.setFirstPersonCamera(null, yawOffset, 0)

    const xrCamera = renderer.xr.getCamera(viewer.camera)
    const d = xrCamera.getWorldDirection()
    bot.entity.yaw = Math.atan2(-d.x, -d.z)
    bot.entity.pitch = Math.asin(d.y)

    bot.physics.stepHeight = 1
    bot.setControlState('forward', hand2.yAxis < -0.5)
    bot.setControlState('back', hand2.yAxis > 0.5)
    bot.setControlState('right', hand2.xAxis < -0.5)
    bot.setControlState('left', hand2.xAxis > 0.5)

    TWEEN.update()
    viewer.update()
    renderer.render(viewer.scene, viewer.camera)
  })
}

module.exports = { initVR }
