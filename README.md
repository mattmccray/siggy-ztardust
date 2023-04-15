# Siggy Ztardust: Unified Signal API Wrapper

| Current Status                   |
| -------------------------------- |
| *Active Development / Pre-Alpha* |

Siggy Ztardust is a Signal API wrapper that enables you to write code for a single API while targeting multiple libraries.

This experimental Signal library wraps other implementations, allowing you to code for one API while targeting multiple frameworks. It comes with a simple default implementation, but it is recommended to use a more battle-tested one like preact/signals, solid-js, or mobx.

```typescript
import { signal, computed, effect, update } from 'siggy-ztardust'
import 'siggy-ztardust/use/preact' // Use preact signals implementation

// Usage
const count = signal(0)
const double = computed(() => count() * 2)

count.subscribe((value) => console.log("Count changed:", value))
double.subscribe((value) => console.log("Double changed:", value))

count.set(1)

const dispose = effect(() => console.log("Count value:", count()))

update(count, (prev) => prev + 1)

dispose() // This will stop the effect from running

count.set((prev) => prev + 1)
```

## Signal Types

```typescript
export interface ReadonlySignal<T> {
  (): T
  subscribe: (cb: (value: T) => void) => () => void
  peek: () => T
}

export interface Signal<T> extends ReadonlySignal<T> {
  set: (value: T) => void
}
```

Siggy Ztardust is ideal for building tools and libraries that should work across frameworks and conform to the signal libraries used in the application.

## Getting Started

```bash
npm install mattmccray/siggy-ztardust
```

***Note:*** siggy-ztardust includes a non-optimized signals implementation that's enabled by default, but it is recommended to use a more battle-tested one. To do this, you'll need to install it separately, as the supported libraries are all optional dependencies in the `package.json`.

In your startup file, include your preferred signals library:

```javascript
// Note: The order shouldn't matter, just include your target signals
//       library before you create your first signal/computed/effect.
import "siggy-ztardust/use/preact"
import { signal } from "siggy-ztardust"
```

If you're using a library that isn't one of the default supported ones, you can add your own like this:

```javascript
import { registerImplementation } from "siggy-ztardust"

registerImplementation({
  signal: createPreactSignal,
  computed: createPreactComputed,
  effect: createPreactEffect,
  batch: createPreactBatchedEffect,
})

// individual functions not shown, but they will conform to this interface:
interface SignalImplementation {
  signal<T>(defaultValue?: T): Signal<T>
  computed<T>(worker: () => T): ReadonlySignal<T>
  effect(worker: () => unknown): () => void
  batch(worker: () => unknown): void
}
```

For examples, refer to the source files located at `$src/use/*.ts`.