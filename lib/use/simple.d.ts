import type { ReadonlySignal as IReadonlySignal, Signal as ISignal } from "../index";
export declare class SimpleSignalImplementation {
    signal<T>(initialValue?: T): ISignal<T>;
    computed<T>(computeFn: () => T): IReadonlySignal<T>;
    effect(effectFn: () => void): () => void;
    batch(worker: () => void): void;
}
