import type { Detection } from '@mediapipe/tasks-vision'
import type { IDetectionState, IInput, IStat } from './types'
import { IStatus } from './types'

const RANGE_THRESHOLD = 0.1


let keyboardState = {
    left: false,
    right: false,
    up: false,
    down: false
}

const keyMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down'
}

const targetKeys = Object.keys(keyMap)

function onKeyDown(event) {
    if (targetKeys.includes(event.key)) {
        const outKey = keyMap[event.key]
        keyboardState[outKey] = true
    }
}

function onKeyUp(event) {
    if (targetKeys.includes(event.key)) {
        const outKey = keyMap[event.key]
        keyboardState[outKey] = false
    }
}



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

    setYInputs() {
        const { config, detection } = this.state
        const yCenter = detectionsToY(detection)
        // y-inputs (up & down)
        const yLowerRange = config.yCenterRange[0]
        const yUpperRange = config.yCenterRange[1]
        const yIsCenter = isInRange(
            yLowerRange,
            yUpperRange,
            yCenter
        )
        if (keyboardState.up
            || keyboardState.down
            || !yIsCenter
        ) {
            const camUp: number = yCenter < yLowerRange ? 1 : 0
            const camDown: number = yCenter > yUpperRange ? 1 : 0
            const up: number = camUp || keyboardState.up ? 1 : 0
            const down: number = camDown || keyboardState.down ? 1 : 0
            this.state.input.up = up
            this.state.input.down = down
        } else {
            this.state.input.up = 0
            this.state.input.down = 0
        }
    }

    setXInputs() {
        const { config, detection } = this.state
        const { mirror } = config
        if (keyboardState.left || keyboardState.right ) {
            this.state.input.left = keyboardState.left ? 1 : 0
            this.state.input.right = keyboardState.right ? 1 : 0
            this.state.input.center = (keyboardState.left || keyboardState.right) ? 0 : 1
            return
        }
        const xCenter = detectionsToBboxCenter(detection)

        // x-inputs (left & right)
        const centerLowerRange = config.xCenterRange[0]
        const centerUpperRange = config.xCenterRange[1]
        const isCenter = isInRange(centerLowerRange, centerUpperRange, xCenter)
        if (!isCenter) {
            // When leaning LEFT, xCenter < centerLowerRange
            const leftLean = xCenter < centerLowerRange
                ? Math.max(0, (config.center - xCenter) / config.center)
                : 0
            
            // When leaning RIGHT, xCenter > centerUpperRange  
            const rightLean = xCenter > centerUpperRange
                ? Math.max(0, (xCenter - config.center) / config.center)
                : 0

            let left = 0
            if ((leftLean && !mirror) || (mirror && rightLean)) {
                left = !mirror
                    ? leftLean
                    : rightLean
            }
            let right: number = 0
            if ((rightLean && !mirror) || (leftLean && mirror)) {
                right = !mirror
                    ? rightLean || 1
                    : leftLean || 1
            }
            
            this.state.input.left = left
            this.state.input.right = right
            this.state.input.center = 0
        } else {
            this.state.input.left = 0
            this.state.input.right = 0
            this.state.input.center = 1
        }
    }

    setInputs() {
        this.setYInputs()
        this.setXInputs()
        return this
    }

    setupKeyListeners() {
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('keyup', onKeyUp)
    }

    destroy() {
        document.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('keyup', onKeyUp)
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