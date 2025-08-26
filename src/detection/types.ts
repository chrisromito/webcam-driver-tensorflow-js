import type { Detection } from '@mediapipe/tasks-vision'

export const IStatus = {
    ERROR: -1,
    INITIAL: 0,
    PENDING: 1,
    ACCEPTED: 2,
    CONFIG_LEFT: 3,
    CONFIG_RIGHT: 4,
    CONFIG_BRAKE: 5,
    CONFIG_GAS: 6,
    CONFIG_COMPLETE: 7
} as const

export type IStat = typeof IStatus[keyof typeof IStatus]

export type Ixy = { x: number, y: number }

export type IDirection = -1 | 0 | 1

export type IInput = {
    left: number,
    right: number,
    up: number,
    down: number,
    center: number
}

export type IConfig = IInput & {
    width: number,
    height: number,
    centerY: number,
    xCenterRange: [number, number],
    yCenterRange: [number, number],
    mirror: boolean
}

export type IDetectionState = {
    status: IStat,
    detection: Detection[]
    config: IConfig,
    input: IInput
}
