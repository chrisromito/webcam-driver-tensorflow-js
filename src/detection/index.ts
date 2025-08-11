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


export async function enableWebcam(video: HTMLVideoElement, width: number, height: number): Promise<MediaStream> {
    const constraints = { video: { width, height }, audio: false }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
    return stream
}


export function detect(video: HTMLVideoElement, { faceDetector }: TFaceDetector): Detection[] {
    let startTimeMs = performance.now()
    return faceDetector.detectForVideo(video, startTimeMs).detections
}


export function renderDetections(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, detections: Detection[], detectionState: DetectionState) {
    const canvas = ctx.canvas
    if (!canvas) {
        return
    }
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    ctx.drawImage(video, 0, 0, width, height)

    

    // Draw vertical center rect (width / 5)
    ctx.beginPath()
    ctx.fillStyle = 'rgba(0, 255, 0, 0.33)'
    const center = width / 2
    const centerMinX = center - (width * 0.1)
    const centerLineWidth = width * 0.2
    ctx.fillRect(
        centerMinX,
        0,
        centerLineWidth,
        height
    )

    // Draw horizontal center rect
    ctx.beginPath()
    ctx.fillStyle = 'rgba(0, 255, 0, 0.33)'
    const yCenter = height / 2
    const centerMinY = yCenter - (height * 0.1)
    const yLineWidth = height * 0.2
    ctx.fillRect(
        0,
        centerMinY,
        width,
        yLineWidth
    )

    if (!detections.length) {
        return
    }
    const detection: Detection = detections[0]
    const { categories, boundingBox, keypoints } = detection
    

    const inputs = detectionState.state.input
    const inputTexts = [
        `Left: ${inputs.left}`,
        `Right: ${inputs.right}`,
        `Up: ${inputs.up}`,
        `Down: ${inputs.down}`
    ]
    inputTexts.forEach((value: string, index: number)=> {
        ctx.font = '12px sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        const yOffset = (index + 1) * 15
        const y = height - yOffset
        ctx.fillText(value, 5, y)
    })
    
    ctx.globalAlpha = 0.2
    
    if (boundingBox) {
        ctx.beginPath()
        ctx.lineWidth = 4
        ctx.strokeStyle = 'green'
        ctx.strokeRect(boundingBox.originX, boundingBox.originY, boundingBox.width, boundingBox.height)
    }
    ctx.globalAlpha = 1.0
}