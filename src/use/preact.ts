import { ReadonlySignal, Signal, registerImplementation } from "../index"
import { signal, computed, effect, batch, ReadonlySignal as IReadonlySignal } from '@preact/signals-core'
// import { testImplementation } from "../util/test"

function createPreactSignal<T>(defaultValue?: T): Signal<T> {
  const innerSignal = signal(defaultValue)
  const sig = wrapSignal(innerSignal)
  sig.set = (newValue: T) => { innerSignal.value = newValue }
  return sig
}

function createPreactComputed<T>(worker: () => T): ReadonlySignal<T> {
  return wrapSignal(computed(worker))
}

function createPreactEffect<T>(worker: () => void): () => void {
  return effect(worker)
}

function createPreactBatchedEffect<T>(worker: () => unknown) {
  batch(worker)
}

registerImplementation({
  signal: createPreactSignal,
  computed: createPreactComputed,
  effect: createPreactEffect,
  batch: createPreactBatchedEffect,
})

function wrapSignal(signal: IReadonlySignal<any>) {
  const sig = (() => signal.value) as Signal<any>
  sig.subscribe = signal.subscribe.bind(signal)
  sig.peek = signal.peek.bind(signal)
  return sig
}

// testImplementation('preact/signals', {
//   signal: createPreactSignal,
//   computed: createPreactComputed,
//   effect: createPreactEffect,
//   batch: createPreactBatchedEffect,
// })