"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSignalImplementation = void 0;
// Global variable to keep track of the currently accessed computed or effect
let currentAccessed = null;
let effectQueue = [];
function executeEffects() {
    while (effectQueue.length > 0) {
        const effect = effectQueue.shift();
        effect === null || effect === void 0 ? void 0 : effect();
    }
}
class Signal {
    constructor(initialValue) {
        this._dependents = [];
        this._value = initialValue;
    }
    get() {
        if (currentAccessed) {
            this._addDependent(currentAccessed);
        }
        return this._value;
    }
    peek() {
        return this._value;
    }
    set(newValue) {
        if (this._value !== newValue) {
            this._value = newValue;
            this._notifyDependents();
            executeEffects();
        }
    }
    subscribe(subscriber) {
        return Effect.withDisposer(() => {
            subscriber(this.get());
        });
    }
    _addDependent(dependent) {
        if (!this._dependents.includes(dependent)) {
            this._dependents.push(dependent);
        }
    }
    _notifyDependents() {
        for (const dependent of this._dependents) {
            dependent();
        }
    }
}
class Computed {
    constructor(computeFn) {
        this._isStale = true;
        this._dependents = [];
        this._update = () => {
            if (!this._isStale) {
                this._isStale = true;
                for (const dependent of this._dependents) {
                    dependent();
                }
            }
        };
        this._value = undefined;
        this._computeFn = computeFn;
    }
    get() {
        if (this._isStale) {
            const previousContext = currentAccessed;
            currentAccessed = this._update;
            this._recomputeValue();
            currentAccessed = previousContext;
        }
        if (currentAccessed) {
            this._addDependent(currentAccessed);
        }
        return this._value;
    }
    peek() {
        return this._value;
    }
    subscribe(subscriber) {
        return Effect.withDisposer(() => {
            subscriber(this.get());
        });
    }
    _addDependent(dependent) {
        if (!this._dependents.includes(dependent)) {
            this._dependents.push(dependent);
        }
    }
    _recomputeValue() {
        this._value = this._computeFn();
        this._isStale = false;
    }
}
class Effect {
    constructor(effectFn) {
        this._isStale = true;
        this._isDisposed = false;
        this._execute = () => {
            if (this._isDisposed)
                return;
            if (this._isStale) {
                currentAccessed = this._update;
                this._effectFn();
                currentAccessed = null;
            }
            this._isStale = false;
        };
        this._update = () => {
            if (this._isDisposed)
                return;
            if (!this._isStale) {
                this._isStale = true;
                effectQueue.push(this._execute);
            }
        };
        this._effectFn = effectFn;
        this._isStale = true;
        this._execute();
    }
    dispose() {
        this._isDisposed = true;
    }
    static withDisposer(effectFn) {
        const effect = new Effect(effectFn);
        return () => {
            effect.dispose();
        };
    }
}
class SimpleSignalImplementation {
    signal(initialValue) {
        let signal = new Signal(initialValue);
        let sig = signal.get.bind(signal);
        sig.set = signal.set.bind(signal);
        sig.subscribe = signal.subscribe.bind(signal);
        sig.peek = signal.peek.bind(signal);
        return sig;
    }
    computed(computeFn) {
        let signal = new Computed(computeFn);
        let sig = signal.get.bind(signal);
        sig.subscribe = signal.subscribe.bind(signal);
        sig.peek = signal.peek.bind(signal);
        return sig;
    }
    effect(effectFn) {
        return Effect.withDisposer(effectFn);
    }
    batch(worker) {
        // TODO: Implement batching
        worker();
    }
}
exports.SimpleSignalImplementation = SimpleSignalImplementation;
