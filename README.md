# Newtk — Minimal Global State Management for React

**Newtk** is a **lightweight, hooks-based state management library** built for modern React. Inspired by Zustand’s simplicity, Newtk helps you manage global state in functional React apps with minimal boilerplate — without reducers, actions, or context wrappers.

## Installation

```bash
npm install newtk
```

## Why Newtk?

* Extremely lightweight (\~2KB gzipped)
* Built with native React hooks
* Simple API — one function to create global store
* No context, no reducers, no extra ceremony
* Fine-grained subscriptions with selectors
* Inspired by Zustand (but even simpler)

---

## Usage Example

```js
// store.js
import createStore from 'newtk';

const [useNewtkStore] = createStore((set, get) => ({
  counter: 0,
  increment: () => set(state => ({ counter: state.counter + 1 })),
  decrement: () => set(state => ({ counter: state.counter - 1 })),
  reset: () => set({ counter: 0 }),
}));

export default useNewtkStore;
```

```jsx
// App.jsx
import React from 'react';
import useNewtkStore from './store';

export default function App() {
  const counter = useNewtkStore(state => state.counter);
  const increment = useNewtkStore(state => state.increment);
  const decrement = useNewtkStore(state => state.decrement);
  const reset = useNewtkStore(state => state.reset);

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>Count: {counter}</h1>
      <button onClick={increment}>➕</button>
      <button onClick={decrement} style={{ margin: '0 10px' }}>➖</button>
      <button onClick={reset}>🔁</button>
    </div>
  );
}
```

---

## 🔄 API

```ts
const [useNewtkStore, api] = createStore(setupFn);
```

- `useNewtkStore(selector)` – React Hook to select and subscribe to slices of state
- `api.subscribe(fn)` – Subscribe manually (outside React)
- `api.accessState()` – Get the current global state
- `api.reset()` – Reset state and clear listeners

---

## Version Log

---

### `v1.0.0` — Initial Release

* Introduced `generate()` function to create global state
* Support for:

  * `set()` to update state
  * `get()` to access state
  * `useStore(selector)` hook to subscribe
  * Basic `subscribe()` / `destroy()`
* No use of `useRef`, selector fallback directly returns entire state.

**Example:**

```js
const [useStore] = generate((set, get) => ({
  data: 0,
  update: () => set({ data: 42 }),
}));
```

---

### `v1.0.1` — Improved React Sync

* **Introduced `useRef` (`liveChunk`)** to avoid stale closures in effects
* Selector fallback now spreads state (`{...state}`) to ensure fresh shallow copy
* More robust shallow equality check to avoid unnecessary re-renders
* Ensures updates are only triggered if the actual selected slice changes

**Why this matters:**
Without `useRef`, stale values may cause missed updates in components due to outdated closures. Now, we always compare against the *latest* selected value in memory.

---

### `v1.0.2` — Refactored Subscription Management

In `v1.0.2`, we moved `subscriptions` into the `globalStore` object to:

- **Keep state and listeners tightly encapsulated** together.
- **Avoid leaking scope variables** like `listeners` across renders.
- **Improve future maintainability** and possible multi-store support.

#### Before:

```js
let listeners = []
let state = { current: ... }
```

#### After:

```js
let globalStore = {
  subscriptions: [],
  current: ...
}
```

This change is **internal** but improves structure significantly **without affecting the external API**.

---

## Version 1.0.4 

#### Fixed: Unnecessary React Re-renders
- Improved internal comparison using `shallowEqual()` to ensure components re-render **only when relevant state changes**, not due to new object references.
- Result: Better performance and predictable render behavior.

#### Added: External `update()` API
- You can now update the store from anywhere — outside of React components — using:
  ```js
  storeAPI.update({ key: value });
  // or
  storeAPI.update(prev => ({ count: prev.count + 1 }));

#### Improved : External `reset()` API

## Best Practices

* Use selectors like `state => state.count` to optimize rendering
* Prefer updating partial state via `set(prev => ({ ... }))`
* You can destructure multiple slices like:

```js
const { user, logout } = useStore(state => ({
  user: state.user,
  logout: state.logout,
}));
```

---

## License

MIT © [Kavya Katal](https://github.com/KatalKavya96)

---