"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.batch = exports.effect = exports.computed = exports.signal = exports.registerImplementation = void 0;
const simple_1 = require("./use/simple");
let impl = new simple_1.SimpleSignalImplementation();
function registerImplementation(builder) {
    impl = builder;
}
exports.registerImplementation = registerImplementation;
function signal(defaultValue) {
    return impl.signal(defaultValue);
}
exports.signal = signal;
function computed(worker) {
    return impl.computed(worker);
}
exports.computed = computed;
function effect(worker) {
    return impl.effect(worker);
}
exports.effect = effect;
function batch(worker) {
    return impl.batch(worker);
}
exports.batch = batch;
function update(signal, updater) {
    signal.set(updater(signal.peek()));
}
exports.update = update;
exports.default = { signal, computed, effect, batch, update };
