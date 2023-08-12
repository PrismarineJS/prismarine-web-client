type Options = boolean | Readonly<AddEventListenerOptions> | undefined

function registerListener<KD extends keyof DocumentEventMap>(
  element: Readonly<Document> | null | undefined,
  eventType: KD,
  // eslint-disable-next-line functional/prefer-immutable-types
  listener: (this: Document, evt: DocumentEventMap[KD]) => void,
  options?: Options,
): void
function registerListener<KH extends keyof HTMLElementEventMap>(
  element: Readonly<HTMLElement> | null | undefined,
  eventType: KH,
  // eslint-disable-next-line functional/prefer-immutable-types
  listener: (this: HTMLElement, evt: HTMLElementEventMap[KH]) => void,
  options?: Options,
): void
function registerListener<KW extends keyof WindowEventMap>(
  element: Readonly<Window> | null | undefined,
  eventType: KW,
  // eslint-disable-next-line functional/prefer-immutable-types
  listener: (this: Window, evt: WindowEventMap[KW]) => void,
  options?: Options,
): void
//@ts-ignore
function registerListener(
  element: Readonly<Document | HTMLElement | Window> | null | undefined,
  eventType: string,
  // eslint-disable-next-line functional/prefer-immutable-types
  listener: (evt: Event) => void,
  options?: Options,
): void

export type RegisterListener = typeof registerListener
