"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const solid_js_1 = require("solid-js");
const test_1 = require("../util/test");
function createSolidSignal(defaultValue) {
    let [value, setValue] = (0, solid_js_1.createSignal)(defaultValue);
    let sig = wrapAccessor(value);
    sig.set = setValue;
    return sig;
}
function createSolidComputed(worker) {
    return wrapAccessor((0, solid_js_1.createMemo)(worker));
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
function wrapAccessor(accessor) {
    const sig = accessor;
    sig.peek = () => (0, solid_js_1.untrack)(sig);
    sig.subscribe = (cb) => createSolidEffect(() => {
        cb(sig());
    });
    return sig;
}
(0, index_1.registerImplementation)({
    signal: createSolidSignal,
    computed: createSolidComputed,
    effect: createSolidEffect,
    batch: createSolidBatchedEffect,
});
(0, test_1.testImplementation)('solid-js', {
    signal: createSolidSignal,
    computed: createSolidComputed,
    effect: createSolidEffect,
    batch: createSolidBatchedEffect,
});
