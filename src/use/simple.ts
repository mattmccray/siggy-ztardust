/*

Based on the excellent article by Gonzalo Ruiz de Villa: 
https://medium.com/gft-engineering/implementing-signals-in-javascript-step-by-step-9d0be46fb014

MIT License

Copyright (c) 2023 Gonzalo Ruiz de Villa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER aDEALINGS IN THE
SOFTWARE.

*/

import type { ReadonlySignal as IReadonlySignal, Signal as ISignal } from "../index"

// Global variable to keep track of the currently accessed computed or effect
let currentAccessed: (() => void) | null = null
let effectQueue: (() => void)[] = []

function executeEffects() {
  while (effectQueue.length > 0) {
    const effect = effectQueue.shift()
    effect?.()
  }
}

class Signal<T> {
  protected _value: T
  protected _dependents: (() => void)[] = []

  constructor(initialValue?: T) {
    this._value = initialValue!
  }

  get() {
    if (currentAccessed) {
      this._addDependent(currentAccessed)
    }
    return this._value
  }

  peek() {
    return this._value
  }

  set(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue
      this._notifyDependents()
      executeEffects()
    }
  }


  subscribe(subscriber: (newValue: T) => void) {
    return Effect.withDisposer(() => {
      subscriber(this.get())
    })
  }


  protected _addDependent(dependent: () => void) {
    if (!this._dependents.includes(dependent)) {
      this._dependents.push(dependent)
    }
  }

  protected _notifyDependents() {
    for (const dependent of this._dependents) {
      dependent()
    }
  }
}

class Computed<T> {
  protected _computeFn: () => T
  protected _value: T
  protected _isStale: boolean = true
  protected _dependents: (() => void)[] = []

  constructor(computeFn: () => T) {
    this._value = undefined as any
    this._computeFn = computeFn
  }

  get() {
    if (this._isStale) {
      const previousContext = currentAccessed
      currentAccessed = this._update
      this._recomputeValue()
      currentAccessed = previousContext
    }
    if (currentAccessed) {
      this._addDependent(currentAccessed)
    }
    return this._value
  }

  peek() {
    return this._value
  }

  subscribe(subscriber: (newValue: T) => void) {
    return Effect.withDisposer(() => {
      subscriber(this.get())
    })
  }

  protected _addDependent(dependent: (() => void)) {
    if (!this._dependents.includes(dependent)) {
      this._dependents.push(dependent)
    }
  }

  protected _recomputeValue() {
    this._value = this._computeFn()
    this._isStale = false
  }

  protected _update = () => {
    if (!this._isStale) {
      this._isStale = true
      for (const dependent of this._dependents) {
        dependent()
      }
    }
  }
}

class Effect {
  protected _effectFn: () => void
  protected _isStale: boolean = true
  protected _isDisposed: boolean = false

  constructor(effectFn: () => void) {
    this._effectFn = effectFn
    this._isStale = true
    this._execute()
  }

  dispose() {
    this._isDisposed = true
  }

  protected _execute = () => {
    if (this._isDisposed) return
    if (this._isStale) {
      currentAccessed = this._update
      this._effectFn()
      currentAccessed = null
    }
    this._isStale = false
  }

  protected _update = () => {
    if (this._isDisposed) return
    if (!this._isStale) {
      this._isStale = true
      effectQueue.push(this._execute)
    }
  }

  static withDisposer<T>(effectFn: () => T): () => void {
    const effect = new Effect(effectFn)
    return () => {
      effect.dispose()
    }
  }
}

export class SimpleSignalImplementation {
  signal<T>(initialValue?: T): ISignal<T> {
    let signal = new Signal(initialValue)
    let sig = signal.get.bind(signal) as ISignal<T>
    sig.set = signal.set.bind(signal)
    sig.subscribe = signal.subscribe.bind(signal)
    sig.peek = signal.peek.bind(signal)
    return sig
  }

  computed<T>(computeFn: () => T): IReadonlySignal<T> {
    let signal = new Computed(computeFn)
    let sig = signal.get.bind(signal) as ISignal<T>
    sig.subscribe = signal.subscribe.bind(signal)
    sig.peek = signal.peek.bind(signal)
    return sig
  }

  effect(effectFn: () => void): () => void {
    return Effect.withDisposer(effectFn)
  }

  batch(worker: () => void) {
    // TODO: Implement batching
    worker()
  }
}

