/**
 * Source: https://www.npmjs.com/package/@mediapipe/tasks-vision
 */
import {
    FaceDetector,
    FilesetResolver,

} from '@mediapipe/tasks-vision'
import type { Detection } from '@mediapipe/tasks-vision'
import { DetectionState } from './detectionState'
import { IStatus } from './types'

export type TFaceDetector = {
    vision: any,
    faceDetector: FaceDetector
}

export async function initializeFaceDetector(): Promise<TFaceDetector> {

    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm")

    const faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite',
            delegate: 'GPU'
        },
        runningMode: 'VIDEO'
    })

    return {
        vision,
        faceDetector
    }
}


export async function enableWebcam(video: HTMLVideoElement): Promise<MediaStream> {
    const constraints = { video: { width: 500, height: 400 }, audio: false }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
    return stream
}


export function detect(video: HTMLVideoElement, { faceDetector }: TFaceDetector): Detection[] {
    let startTimeMs = performance.now()
    return faceDetector.detectForVideo(video, startTimeMs).detections
}


const REMOVE_CLASS = 'prediction'

function addClass(el: HTMLElement) {
    el.classList.add(REMOVE_CLASS)
}


export function displayVideoDetections(video: HTMLVideoElement, liveView: HTMLElement, detections: Detection[], detectionState: DetectionState) {
    [...liveView.querySelectorAll(`.${REMOVE_CLASS}`)].forEach(predictionEl => {
        liveView.removeChild(predictionEl)
    })

    if (!detections.length) {
        return
    }
    const detection = detections[0]

    // Iterate through predictions and draw them to the live view
    const { categories, boundingBox } = detection

    if (categories && boundingBox) {
        const p = document.createElement("p")
        addClass(p)
        const confidence = Math.round(categories[0].score * 100)
        p.innerText = `Confidence: ${confidence}%`

        const left = video.offsetWidth - boundingBox.width - boundingBox.originX
        const top = boundingBox.originY - 30
        const width = boundingBox.width - 10
        const style = `left: ${left}px; top: ${top}px; width: ${width} px`
        p.style = style

        const highlighter = document.createElement("div")
        addClass(highlighter)
        highlighter.classList.add('highlighter')
        highlighter.style = style
        liveView.appendChild(highlighter)
        liveView.appendChild(p)

    }

    // Store drawn objects in memory so they are queued to delete at next call
    for (let keypoint of detection.keypoints) {
        const keypointEl = document.createElement("span")
        addClass(keypointEl)
        keypointEl.classList.add('key-point')
        keypointEl.style.top = `${keypoint.y * video.offsetHeight - 3}px`
        keypointEl.style.left = `${video.offsetWidth - keypoint.x * video.offsetWidth - 3}px`
        liveView.appendChild(keypointEl)
        // console.log(JSON.stringify(keypoint, null, 4))
    }

    if (detectionState.state.config.center !== 0) {
        const centerEl = document.createElement('div')
        addClass(centerEl)
        centerEl.classList.add('center')
        centerEl.style.left = `${video.offsetWidth - detectionState.state.config.center}px`
        liveView.appendChild(centerEl)
    }
}


export function renderDetections(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, detections: Detection[], detectionState: DetectionState) {
    const width = 500
    const height = 400
    ctx.drawImage(video, 0, 0, width, height)

    if (!detections.length) {
        return
    }
    const detection: Detection = detections[0]
    const { categories, boundingBox, keypoints } = detection
    if (categories) {
        const confidence = Math.round(categories[0].score * 100)
        const label = `Confidence: ${confidence}%`
        ctx.font = '30px sans-serif'
        // ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillText(label, 0, height - 30)
    }
    keypoints.forEach(keypoint => {
        ctx.globalAlpha = 1.0
        ctx.beginPath()
        ctx.lineWidth = 4
        ctx.strokeStyle = 'red'
        ctx.ellipse(keypoint.x, keypoint.y, 5, 5, 0, 0, 0)
        ctx.stroke()
    })

    
    if (boundingBox) {
        ctx.beginPath()
        ctx.lineWidth = 4
        ctx.strokeStyle = 'green'
        ctx.globalAlpha = 0.2
        ctx.strokeRect(boundingBox.originX, boundingBox.originY, boundingBox.width, boundingBox.height)
        ctx.globalAlpha = 1.0
    }
}