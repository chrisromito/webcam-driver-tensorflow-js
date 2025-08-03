import './style.css'
import { initializeFaceDetector, enableWebcam, detect, displayVideoDetections } from './detection'
import { run } from './game'
import { DetectionState } from './detection/detectionState'
import { IStatus } from './detection/types'
import { show, hide } from './libs/dom'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <div class="input-container">
      <div class="webcam-input">
        <div id="live-view">
          <video id="video" class="webcam-visual" autoplay playsinline></video>
        </div>
      </div>
      <div id="steps" class="steps">
        <div id="step-1" class="step hide">
          <p>
            Stand Center
          </p>
        </div>
        <div id="step-2" class="step hide">
          <p>
            Lean left
          </p>
        </div>
        <div id="step-3" class="step hide">
          <p>
            Lean right
          </p>
        </div>
        <div id="step-4" class="step hide">
          <p>
            Look up (accelerate)
          </p>
        </div>
        <div id="step-5" class="step hide">
          <p>
            Look down (brake)
          </p>
        </div>
        <div id="step-6" class="step hide">
          <h5>Configuration Complete</h5>
          <p>
            Lean left to steer left
          </p>
          <p>
            Lean right to steer right
          </p>
        </div>
        <button id="step-button" class="step-button">Next</button>
      </div>
    </div>
    <div id="game-container" class="game-container"></div>
  </div>
`

const detectionState = new DetectionState()
// @ts-ignore
const video: HTMLVideoElement | null = document.getElementById('video')
// Remove any highlighting from previous frame.
const liveView: HTMLElement | null = document.getElementById('live-view')

const button = document.getElementById('step-button')

async function main() {

  if (!video || !liveView) {
    return
  }
  detectionState.setStatus(IStatus.PENDING)
  const stream = await enableWebcam(video)
  detectionState.setStatus(IStatus.ACCEPTED)

  console.log('Initializing face detector...')
  const detector = await initializeFaceDetector()
  let lastStatus = detectionState.state.status
  await configStepLoop(detector)
  // Block until config is complete
  while (detectionState.state.status !== IStatus.CONFIG_COMPLETE) {
    await sleep(100)
    if (detectionState.state.status !== lastStatus) {
      console.log('Status changed, calling configStepLoop')
      await configStepLoop(detector)
      lastStatus = detectionState.state.status
    } else {
        console.log('awaiting config completion, displaying detection results in the meantime')
        const detections = detect(video, detector)
        displayVideoDetections(video, liveView, detections, detectionState)
    }
  }
  console.log('Booting game...')
  await run()

  console.log('Detection loop is beginning')

  let loopCounter = 0
  while (detectionState.state.status === IStatus.CONFIG_COMPLETE) {
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
  if (detectionState.state.status === IStatus.CONFIG_COMPLETE) {
    hideSteps()
    showStep(6)
    return true
  }
  // Kick off the 'configure left' step
  if (detectionState.state.status === IStatus.ACCEPTED) {
    console.log('Start config step 1')
    hideSteps()
    showStep(1)
    button.addEventListener('click', () => {
      const detections = detect(video, detector)
      detectionState.configCenter(detections)
    }, {
      once: true
    })
  }
  if (detectionState.state.status === IStatus.CONFIG_LEFT) {
    console.log('Start config step 2')
    hideSteps()
    showStep(2)
    button.addEventListener('click', () => {
      const detections = detect(video, detector)
      detectionState.configLeft(detections)
    }, { once: true })
  }
  if (detectionState.state.status === IStatus.CONFIG_RIGHT) {
    console.log('Start config step 3')
    hideSteps()
    showStep(3)
    button.addEventListener('click', () => {
      const detections = detect(video, detector)
      detectionState.configRight(detections)
    }, { once: true })
  }
  if (detectionState.state.status === IStatus.CONFIG_BRAKE) {
    console.log('Start config step 4')
    hideSteps()
    showStep(4)
    button.addEventListener('click', () => {
      const detections = detect(video, detector)
      detectionState.configBrake(detections)
    }, { once: true })
  }
  if (detectionState.state.status === IStatus.CONFIG_GAS) {
    console.log('Start config step 5')
    hideSteps()
    showStep(5)
    button.addEventListener('click', () => {
      const detections = detect(video, detector)
      detectionState.configGas(detections)
    }, { once: true })
  }
}


function hideSteps() {
  const steps = [...document.querySelectorAll('.steps .step')]
  steps.forEach(hide)
}

function showStep(value: number) {
  const step = document.getElementById(`step-${value}`)
  if (step) {
    show(step)
  }
}

/**
 * MAIN DETECTION LOOP
 */
async function detectionLoop(detector, loopCounter: number = 0) {
  const detections = detect(video, detector)
  detectionState.state.detection = detections
  detectionState.setInputs()
  await sleep(50)
  if (loopCounter > 0) {
    displayVideoDetections(video, liveView, detections, detectionState)
  }
}


async function sleep(ms: number) {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}

main()
