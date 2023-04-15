"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const signals_core_1 = require("@preact/signals-core");
// import { testImplementation } from "../util/test"
function createPreactSignal(defaultValue) {
    const innerSignal = (0, signals_core_1.signal)(defaultValue);
    const sig = wrapSignal(innerSignal);
    sig.set = (newValue) => { innerSignal.value = newValue; };
    return sig;
}
function createPreactComputed(worker) {
    return wrapSignal((0, signals_core_1.computed)(worker));
}
function createPreactEffect(worker) {
    return (0, signals_core_1.effect)(worker);
}
function createPreactBatchedEffect(worker) {
    (0, signals_core_1.batch)(worker);
}
(0, index_1.registerImplementation)({
    signal: createPreactSignal,
    computed: createPreactComputed,
    effect: createPreactEffect,
    batch: createPreactBatchedEffect,
});
function wrapSignal(signal) {
    const sig = (() => signal.value);
    sig.subscribe = signal.subscribe.bind(signal);
    sig.peek = signal.peek.bind(signal);
    return sig;
}
// testImplementation('preact/signals', {
//   signal: createPreactSignal,
//   computed: createPreactComputed,
//   effect: createPreactEffect,
//   batch: createPreactBatchedEffect,
// })
