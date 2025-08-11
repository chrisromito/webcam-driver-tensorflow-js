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
                center: 0,
                centerY: 0,
                width: 0,
                height: 0,
                xCenterRange: [0, 0],
                yCenterRange: [0, 0],
                mirror: true
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
        const { mirror } = config
        const xCenter = detectionsToBboxCenter(detection)
        const yCenter = detectionsToY(detection)

        // x-inputs (left & right)
        const centerLowerRange = config.xCenterRange[0]
        const centerUpperRange = config.xCenterRange[1]
        const isCenter = isInRange(centerLowerRange, centerUpperRange, xCenter)
        if (!isCenter) {
            // When leaning LEFT, xCenter < centerLowerRange
            const left = xCenter < centerLowerRange
                ? Math.max(0, (config.center - xCenter) / config.center)
                : 0
            
            // When leaning RIGHT, xCenter > centerUpperRange  
            const right = xCenter > centerUpperRange
                ? Math.max(0, (xCenter - config.center) / config.center)
                : 0 
            
            this.state.input.left = !mirror ? left : right
            this.state.input.right = !mirror ? right : left
        } else {
            this.state.input.left = 0
            this.state.input.right = 0
        }

        // y-inputs (up & down)
        const yLowerRange = config.yCenterRange[0]
        const yUpperRange = config.yCenterRange[1]
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
    }

    setStatus(status: IStat) {
        this.state.status = status
    }

    setCenter(width: number, height: number) {
        const xCenter = width /2
        const yCenter = height / 2

        this.state.config.center = xCenter
        this.state.config.centerY = yCenter
        this.state.config.width = width
        this.state.config.height = height

        const centerMinX = xCenter - (width * 0.1)
        const centerMaxX = xCenter + (width * 0.1)
        this.state.config.xCenterRange = [centerMinX, centerMaxX]

        const centerMinY = yCenter - (height * 0.1)
        const centerMaxY = yCenter + (height * 0.1)
        this.state.config.yCenterRange = [centerMinY, centerMaxY]
    }

    configCenter(detections: Detection[], width: number, height: number) {
        const bbCenter: number | null = detectionsToBboxCenter(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.center = width / 2
        this.state.config.centerY = height / 2
        this.state.status = IStatus.CONFIG_LEFT
        this.configLeft(detections)
        this.configRight(detections)
        this.configBrake(detections)
        this.configGas(detections)
        this.state.status = IStatus.CONFIG_COMPLETE

        return true
    }

    configLeft(detections: Detection[]) {
        const bbCenter: number | null = detectionsToBboxCenter(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.left = bbCenter
        this.state.status = IStatus.CONFIG_RIGHT
        return true
    }

    configRight(detections: Detection[]) {
        const bbCenter: number | null = detectionsToBboxCenter(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.right = bbCenter
        this.state.status = IStatus.CONFIG_BRAKE
        return true
    }

    configBrake(detections: Detection[]) {
        const bbCenter: number | null = detectionsToY(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.right = bbCenter
        this.state.status = IStatus.CONFIG_GAS
        return true
    }

    configGas(detections: Detection[]) {
        const bbCenter: number | null = detectionsToY(detections)
        if (bbCenter === null) {
            return false
        }
        this.state.config.right = bbCenter
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