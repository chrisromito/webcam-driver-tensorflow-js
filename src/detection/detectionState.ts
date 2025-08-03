import type { Detection } from '@mediapipe/tasks-vision'
import type { IDetectionState, IInput, IStat } from './types'
import { IStatus } from './types'

const RANGE_THRESHOLD = 0.1

export class DetectionState {
    state: IDetectionState

    constructor() {
        this.state = {
            status: IStatus.INITIAL,
            detection: [],
            config: {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                center: 0
            },
            input: {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                center: 0
            }
        }
    }

    setInputs() {
        const { config, detection } = this.state
        const xCenter = detectionsToBboxCenter(detection)
        const yCenter = detectionsToY(detection)

        // x-inputs (left & right)
        const centerLowerRange = config.center * (1 - RANGE_THRESHOLD)
        const centerUpperRange = config.center * (1 + RANGE_THRESHOLD)
        const isCenter = isInRange(centerLowerRange, centerUpperRange, xCenter)
        if (!isCenter) {
            const left = xCenter > centerLowerRange
                ? 1
                : 0
            const right = xCenter < centerUpperRange
                ? 1
                : 0
            this.state.input.left = left
            this.state.input.right = right
        } else {
            this.state.input.left = 0
            this.state.input.right = 0
        }

        // y-inputs (up & down)
        const yLowerRange = config.up * (1 - RANGE_THRESHOLD)
        const yUpperRange = config.up * (1 + RANGE_THRESHOLD)
        const yIsCenter = isInRange(
            yLowerRange,
            yUpperRange,
            yCenter
        )
        if (!yIsCenter) {
            const up = yCenter < yLowerRange ? 1 : 0
            const down = yCenter > yUpperRange ? 1 : 0
            this.state.input.up = up
            this.state.input.down = down
        } else {
            this.state.input.up = 0
            this.state.input.down = 0
        }
        console.log(`Detection State -> Inputs: ${JSON.stringify({ input: this.state.input })}`)
    }

    setStatus(status: IStat) {
        this.state.status = status
    }

    configCenter(detections: Detection[]) {
        const bbCenter: number | null = detectionsToBboxCenter(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.center = bbCenter
        console.log(JSON.stringify({ fn: 'configCenter', config: this.state.config }))
        this.state.status = IStatus.CONFIG_LEFT
        return true
    }

    configLeft(detections: Detection[]) {
        const bbCenter: number | null = detectionsToBboxCenter(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.left = bbCenter
        console.log(JSON.stringify({ fn: 'configLeft', config: this.state.config }))
        this.state.status = IStatus.CONFIG_RIGHT
        return true
    }

    configRight(detections: Detection[]) {
        const bbCenter: number | null = detectionsToBboxCenter(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.right = bbCenter
        console.log(JSON.stringify({ fn: 'configRight', config: this.state.config }))
        this.state.status = IStatus.CONFIG_BRAKE
        return true
    }

    configBrake(detections: Detection[]) {
        const bbCenter: number | null = detectionsToY(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.right = bbCenter
        console.log(JSON.stringify({ fn: 'configBrake', config: this.state.config }))
        this.state.status = IStatus.CONFIG_GAS
        return true
    }

    configGas(detections: Detection[]) {
        const bbCenter: number | null = detectionsToY(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.right = bbCenter
        console.log(JSON.stringify({ fn: 'configGas', config: this.state.config }))
        this.state.status = IStatus.CONFIG_COMPLETE
        return true
    }
}

function detectionsToBboxCenter(detections: Detection[]): number | null {
    if (!detections.length) {
        return null
    }
    const detection: Detection = detections[0]
    const { boundingBox, categories } = detection
    if (!(boundingBox && categories)) {
        return null
    }
    return bboxCenter(boundingBox.originX, boundingBox.width)
}

function detectionsToY(detections: Detection[]): number | null {
if (!detections.length) {
        return null
    }
    const detection: Detection = detections[0]
    const { boundingBox, categories } = detection
    if (!(boundingBox && categories)) {
        return null
    }
    return bboxCenter(boundingBox.originY, boundingBox.height)
}

function bboxCenter(originX: number, width: number): number {
    return originX + (width / 2)
}

function isInRange(lower: number, upper: number, n: number) {
    return n >= lower && upper >= n
}