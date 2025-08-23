import './style.css'
import { Arrows } from './libs/dom'
import { initializeFaceDetector, enableWebcam, detect, renderDetections } from './detection'
// import { startGame } from './game'
import { setup as setupGame } from './carGame'
import { DetectionState } from './detection/detectionState'
import { IStatus } from './detection/types'
// Track generation now handled by TrackLoader module


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <div class="input-container">
      <div class="webcam-input">
        <canvas id="canvas" class="webcam-render"  width="250" height="200"></canvas>
        <video id="video" class="webcam-visual" autoplay playsinline></video>
      </div>
      <div class="input-config">
        ${Arrows.initial()}
      </div>
    </div>
    <div class="game-row">
      <div id="game-container" class="game-container"></div>
    </div>
  </div>
`

const detectionState = new DetectionState()
// @ts-ignore
const video: HTMLVideoElement | null = document.getElementById('video')
// Remove any highlighting from previous frame.


async function main() {

  if (!video) {
    return
  }
  detectionState.setStatus(IStatus.PENDING)
  const stream = await enableWebcam(video, canvas.offsetWidth, canvas.offsetHeight)
  detectionState.setStatus(IStatus.ACCEPTED)
  detectionState.setupKeyListeners()

  console.log('Initializing face detector...')
  const detector = await initializeFaceDetector()
  await configStepLoop(detector)
  console.log('Booting game...')
  // await startGame(detectionState)
  setupGame('game-container', detectionState)

  console.log('Detection loop is beginning')

  let loopCounter = 0
  while (detectionState.state.status !== IStatus.ERROR) {
    await detectionLoop(detector, loopCounter)
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
async function configStepLoop(detector) {
  if (canvas) {
    detectionState.setCenter(canvas.offsetWidth, canvas.offsetHeight)
  }
  try {
    const detections = detect(video, detector)
    detectionState.configCenter(detections, canvas.offsetWidth, canvas.offsetHeight)
    await sleep(100)
    await detectionLoop(detector, 1)
  } catch (error) {
    console.error(error)
    return false
  }
  return true
}


/**
 * MAIN DETECTION LOOP
 */

const canvas = document.getElementById('canvas')

async function detectionLoop(detector, loopCounter: number = 0) {
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
  return await new Promise((resolve)=> {
    requestAnimationFrame(()=> resolve(true))
  })
}

async function sleep(ms: number) {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}

main()
