
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

