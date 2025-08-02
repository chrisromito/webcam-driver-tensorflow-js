import './style.css'
import { initializeFaceDetector, enableWebcam, detect, displayVideoDetections } from './detection'
import { run } from './game'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <div class="input-container">
      <div id="webcam-input" class="webcam-input">
        <video id="video" class="webcam-visual" autoplay playsinline></video>
      </div>
      <div id="steps" class="steps">
        <div id="step-1" class="step">
          <p>
            Stand Center
          </p>
        </div>
        <div id="step-2" class="step">
          <p>
            Lean left
          </p>
        </div>
        <div id="step-3" class="step">
          <p>
            Lean right
          </p>
        </div>
        <div id="step-4" class="step">
          <p>
            Look up (accelerate)
          </p>
        </div>
        <div id="step-5" class="step">
          <p>
            Look down (brake)
          </p>
        </div>
        <button id="step-button" class="step-button"></button>
      </div>
    </div>
    <div id="game-container" class="game-container"></div>
  </div>
`


async function main() {
  // @ts-ignore
  const video: HTMLVideoElement | null = document.getElementById('video')
  // Remove any highlighting from previous frame.
  const liveView: HTMLElement | null = document.getElementById('webcam-input')

  if (!video || !liveView) {
    return
  }

  const stream = await enableWebcam(video)
  console.log('Initializing face detector...')
  const detector = await initializeFaceDetector()
  await run()

  while (true) {
    const detections = detect(video, detector)
    displayVideoDetections(video, liveView, detections)
    await sleep(50)
  }


}

async function sleep(ms: number) {
  return await new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}

main()
