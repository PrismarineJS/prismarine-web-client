type Options = boolean | Readonly<AddEventListenerOptions> | undefined

function registerListener<KD extends keyof DocumentEventMap>(
  element: Readonly<Document> | null | undefined,
  eventType: KD,
  listener: (this: Document, evt: DocumentEventMap[KD]) => void,
  options?: Options,
): void
function registerListener<KH extends keyof HTMLElementEventMap>(
  element: Readonly<HTMLElement> | null | undefined,
  eventType: KH,
  listener: (this: HTMLElement, evt: HTMLElementEventMap[KH]) => void,
  options?: Options,
): void
function registerListener<KW extends keyof WindowEventMap>(
  element: Readonly<Window> | null | undefined,
  eventType: KW,
  listener: (this: Window, evt: WindowEventMap[KW]) => void,
  options?: Options,
): void
//@ts-expect-error
function registerListener(
  element: Readonly<Document | HTMLElement | Window> | null | undefined,
  eventType: string,
  listener: (evt: Event) => void,
  options?: Options,
): void

export type RegisterListener = typeof registerListener
