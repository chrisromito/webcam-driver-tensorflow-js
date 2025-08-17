import type { IInput } from '../detection/types'
export type El = HTMLElement

const HIDE_CLASS = 'hide'

export function show(el: El): El {
    el.classList.remove(HIDE_CLASS)
    return el
}

export function hide(el: El): El {
    el.classList.add(HIDE_CLASS)
    return el
}

// Source: https://icons.getbootstrap.com/icons/caret-left-square-fill/
const arrow = {
    default: `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M10.205 12.456A.5.5 0 0 0 10.5 12V4a.5.5 0 0 0-.832-.374l-4.5 4a.5.5 0 0 0 0 .748l4.5 4a.5.5 0 0 0 .537.082"/>
</svg>`,
    active: `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-caret-left-square-fill" viewBox="0 0 16 16">
  <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm10.5 10V4a.5.5 0 0 0-.832-.374l-4.5 4a.5.5 0 0 0 0 .748l4.5 4A.5.5 0 0 0 10.5 12"/>
</svg>`
}


export const Arrows = {
    left: arrow,
    initial: (): string => {
        return `
            <div class="arrows">
                <div id="arrow-left" class="arrow arrow-left">
                    ${arrow.default}
                </div>
                <div class="center-arrows">
                    <div id="arrow-up" class="arrow arrow-up">
                        ${arrow.default}
                    </div>
                    
                    <div id="arrow-down" class="arrow arrow-down">
                        ${arrow.default}
                    </div>
                </div>
                <div id="arrow-right" class="arrow arrow-right">
                    ${arrow.default}
                </div>
            </div>
        `
    },
    update: (directionInput: IInput): void => {
        Object.entries(directionInput).forEach(([key, value])=> {
            const element = document.getElementById(`arrow-${key}`)
            if (!element) {
                return
            }
            element.innerHTML = value >= 0.01 ? arrow.active : arrow.default
        })
    }
}