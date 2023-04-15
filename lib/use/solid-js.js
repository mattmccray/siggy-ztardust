"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const solid_js_1 = require("solid-js");
// import { testImplementation } from "../util/test"
function createSolidSignal(defaultValue) {
    let [value, setValue] = (0, solid_js_1.createSignal)(defaultValue);
    // Create a signal that is also a function
    let sig = value;
    sig.set = setValue;
    sig.peek = () => (0, solid_js_1.untrack)(value);
    sig.subscribe = (cb) => createSolidEffect(() => {
        cb(value());
    });
    return sig;
}
function createSolidComputed(worker) {
    return worker(); // I think is just just how Solid works
}
function createSolidEffect(worker) {
    const dispose = (0, solid_js_1.createRoot)(disposer => {
        (0, solid_js_1.createEffect)(() => {
            const v = worker();
        });
        return disposer;
    });
    if ((0, solid_js_1.getOwner)())
        (0, solid_js_1.onCleanup)(dispose);
    return dispose;
}
function createSolidBatchedEffect(worker) {
    (0, solid_js_1.batch)(worker);
}
(0, index_1.registerImplementation)({
    signal: createSolidSignal,
    computed: createSolidComputed,
    effect: createSolidEffect,
    batch: createSolidBatchedEffect,
});
// testImplementation('solid-js', {
//   signal: createSolidSignal,
//   computed: createSolidComputed,
//   effect: createSolidEffect,
//   batch: createSolidBatchedEffect,
// })
