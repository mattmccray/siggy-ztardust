export interface ReadonlySignal<T> {
    (): T;
    subscribe: (cb: (value: T) => void) => () => void;
    peek: () => T;
}
export interface Signal<T> extends ReadonlySignal<T> {
    set: (value: T) => void;
}
/** End user won't need this, it's for interal implementations to use. */
export interface SignalImplementation {
    signal<T>(defaultValue?: T): Signal<T>;
    computed<T>(worker: () => T): ReadonlySignal<T>;
    effect(worker: () => unknown): () => void;
    batch(worker: () => unknown): void;
}
export declare function registerImplementation(builder: SignalImplementation): void;
export declare function signal<T>(defaultValue?: T): Signal<T>;
export declare function computed<T>(worker: () => T): ReadonlySignal<T>;
export declare function effect<T>(worker: () => unknown): () => void;
export declare function batch<T>(worker: () => unknown): void;
export declare function update<T>(signal: Signal<T>, updater: (current: T) => T): void;
declare const _default: {
    signal: typeof signal;
    computed: typeof computed;
    effect: typeof effect;
    batch: typeof batch;
    update: typeof update;
};
export default _default;
