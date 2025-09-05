import './style.css'
import { Arrows, hide } from './libs/dom'
import FlipIcon from './assets/flip_camera_ios_icon.svg'
import { initializeFaceDetector, detect, renderDetections } from './detection'
import { DetectionState } from './detection/detectionState'
import { IStatus } from './detection/types'



document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <div class="input-container">
      <div class="webcam-input">
        <button id="enable">
          Give Video Access
        </button>
        <canvas id="canvas" class="webcam-render"  width="250" height="200"></canvas>
        <video id="video" class="webcam-visual" autoplay playsinline>
          Video stream not available.
        </video>
      </div>
      <div class="input-config">
        <div class="mirror-button-container i-flex justify-center p2">
          <button id="mirror-button" class="mirror-button"></button>
        </div>
        ${Arrows.initial()}
      </div>
    </div>
    <div class="game-row flex align-center justify-center">
      <div id="game-container" class="game-container flex align-center justify-center">
        <div class="lds-dual-ring">
          Loading Game...
        </div>
      </div>
    </div>
    <div class="credits">
      <a href="https://doc.babylonjs.com/guidedLearning/workshop/Car_Driven/">Original Car Game Code Provided by Babylon.js</a>
    </div>
  </div>
`

const detectionState = new DetectionState()

const canvas = document.getElementById('canvas')
const mirrorButton = document.getElementById('mirror-button')
const allowButton = document.getElementById('enable')
allowButton.addEventListener('click', () => {
    onAllow()
})


function onMirrorButtonClick() {
    detectionState.toggleMirror()
}

mirrorButton?.addEventListener('click', onMirrorButtonClick)
if (mirrorButton) {
    mirrorButton.style.backgroundImage = `url("${FlipIcon}")`
}

// Add event listeners for Arrows

async function onAllow() {
    // @ts-ignore
    const video: HTMLVideoElement = document.getElementById('video')
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const constraints = { video: { width, height }, audio: false }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
    await new Promise(resolve => {
        video.onloadedmetadata = () => {
            video.play()
            resolve(true)
        }
    })
    hide(allowButton)
    return main()
}


async function main() {
    // @ts-ignore
    const video: HTMLVideoElement = document.getElementById('video')
    if (!video) {
        return
    }
    detectionState.setStatus(IStatus.PENDING)
    Arrows.setUpListeners(detectionState)
    detectionState.setStatus(IStatus.ACCEPTED)
    detectionState.setupKeyListeners()

    const detector = await initializeFaceDetector()
    await configStepLoop(video, detector)
    hide(video)
    const carGame = await import('./carGame').then((m) => m.default)
    carGame('game-container', detectionState)

    let loopCounter = 0
    while (detectionState.state.status !== IStatus.ERROR) {
        await detectionLoop(video, detector, loopCounter)
        if (loopCounter > 0) {
            loopCounter = 0
        }
        else {
            loopCounter++
        }
    }
}

/**
 * Config Steps
 */
async function configStepLoop(video: HTMLVideoElement, detector) {
    if (canvas) {
        detectionState.setCenter(canvas.offsetWidth, canvas.offsetHeight)
    }
    try {
        const detections = detect(video, detector)
        detectionState.configCenter(detections, canvas.offsetWidth, canvas.offsetHeight)
        await sleep(100)
        await detectionLoop(video, detector, 1)
    } catch (error) {
        console.error(error)
        return false
    }
    return true
}


/**
 * MAIN DETECTION LOOP
 */


async function detectionLoop(video: HTMLVideoElement, detector, loopCounter: number = 0) {
    const detections = detect(video, detector)
    detectionState.state.detection = detections
    detectionState.setInputs()
    await nextTick()
    if (loopCounter > 0) {
        // @ts-ignore
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d')
        renderDetections(ctx, video, detections, detectionState)
    } else {
        renderArrows(detectionState)
    }
}


function renderArrows(dState: DetectionState) {
    Arrows.update(dState.state.input)
}


async function nextTick(): Promise<boolean> {
    return await new Promise((resolve) => {
        requestAnimationFrame(() => resolve(true))
    })
}

async function sleep(ms: number) {
    return await new Promise((resolve) => {
        setTimeout(() => resolve(true), ms)
    })
}

// main()
