import { SimpleSignalImplementation } from "./use/simple"

export interface ReadonlySignal<T> {
  (): T
  subscribe: (cb: (value: T) => void) => () => void
  peek: () => T
}

export interface Signal<T> extends ReadonlySignal<T> {
  set: (value: T) => void
}

/** End user won't need this, it's for interal implementations to use. */
export interface SignalImplementation {
  signal<T>(defaultValue?: T): Signal<T>
  computed<T>(worker: () => T): ReadonlySignal<T>
  effect(worker: () => unknown): () => void
  batch(worker: () => unknown): void
}

let impl: SignalImplementation = new SimpleSignalImplementation()

export function registerImplementation(builder: SignalImplementation) {
  impl = builder
}


export function signal<T>(defaultValue?: T): Signal<T> {
  return impl.signal(defaultValue)
}

export function computed<T>(worker: () => T): ReadonlySignal<T> {
  return impl.computed(worker)
}

export function effect<T>(worker: () => unknown): () => void {
  return impl.effect(worker)
}

export function batch<T>(worker: () => unknown) {
  return impl.batch(worker)
}

export function update<T>(signal: Signal<T>, updater: (current: T) => T) {
  signal.set(updater(signal.peek()))
}


export default { signal, computed, effect, batch, update }