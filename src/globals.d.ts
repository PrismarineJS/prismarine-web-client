declare const THREE: typeof import('three');

declare interface Document {
    getElementById(id): any
}

declare interface DocumentFragment {
    getElementById(id): HTMLElement & Record<string, any>
    querySelector(id): HTMLElement & Record<string, any>
}

declare interface Window extends Record<string, any> {

}
