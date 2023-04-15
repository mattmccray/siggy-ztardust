import { ReadonlySignal, Signal, registerImplementation } from "../index"
import { createEffect, createRoot, createSignal, getOwner, onCleanup, untrack, batch, createMemo, Accessor } from "solid-js"
import { testImplementation } from "../util/test"

function createSolidSignal<T>(defaultValue?: T): Signal<T> {
  let [value, setValue] = createSignal(defaultValue)
  let sig = wrapAccessor(value)
  sig.set = setValue
  return sig
}

function createSolidComputed<T>(worker: () => T): ReadonlySignal<T> {
  return wrapAccessor(createMemo(worker))
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

function wrapAccessor<T>(accessor: Accessor<T>) {
  const sig = accessor as Signal<any>
  sig.peek = () => untrack(sig)!
  sig.subscribe = (cb: (value: T) => void) => createSolidEffect(() => {
    cb(sig()!)
  })
  return sig
}

registerImplementation({
  signal: createSolidSignal,
  computed: createSolidComputed,
  effect: createSolidEffect,
  batch: createSolidBatchedEffect,
})

testImplementation('solid-js', {
  signal: createSolidSignal,
  computed: createSolidComputed,
  effect: createSolidEffect,
  batch: createSolidBatchedEffect,
})

