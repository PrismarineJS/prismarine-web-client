declare const THREE: typeof import('three');
// todo
declare const bot: import('mineflayer').Bot
declare const singlePlayerServer: any

declare interface Document {
    getElementById(id): any
}

declare interface DocumentFragment {
    getElementById(id): HTMLElement & Record<string, any>
    querySelector(id): HTMLElement & Record<string, any>
}

declare interface Window extends Record<string, any> {

}
