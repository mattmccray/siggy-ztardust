import { ReadonlySignal, Signal, registerImplementation } from "../index"
import { createEffect, createRoot, createSignal, getOwner, onCleanup, untrack, batch } from "solid-js"
// import { testImplementation } from "../util/test"

function createSolidSignal<T>(defaultValue?: T): Signal<T> {
  let [value, setValue] = createSignal(defaultValue)
  // Create a signal that is also a function
  let sig = value as Signal<T>
  sig.set = setValue
  sig.peek = () => untrack(value)!
  sig.subscribe = (cb: (value: T) => void) => createSolidEffect(() => {
    cb(value()!)
  })
  return sig
}

function createSolidComputed<T>(worker: () => T): ReadonlySignal<T> {
  return worker() as ReadonlySignal<T> // I think is just just how Solid works
}

function createSolidEffect<T>(worker: () => void): () => void {
  const dispose = createRoot(disposer => {
    createEffect(() => {
      const v = worker()
    })
    return disposer
  })
  if (getOwner()) onCleanup(dispose)
  return dispose
}

function createSolidBatchedEffect<T>(worker: () => void): void {
  batch(worker)
}

registerImplementation({
  signal: createSolidSignal,
  computed: createSolidComputed,
  effect: createSolidEffect,
  batch: createSolidBatchedEffect,
})

// testImplementation('solid-js', {
//   signal: createSolidSignal,
//   computed: createSolidComputed,
//   effect: createSolidEffect,
//   batch: createSolidBatchedEffect,
// })

