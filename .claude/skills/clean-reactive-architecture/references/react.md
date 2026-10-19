# React

How the units map onto React + Redux Toolkit / RTK Query, following the React
sample (`clean-reactive/sample-react`).

## Unit mapping

| Unit | React / RTK |
| --- | --- |
| Application business entity | Redux slice (`createSlice`) |
| Enterprise business entity | TypeScript type |
| `gateway<I>` | TypeScript interface |
| Repository (gateway + entities) | RTK Query `createApi` |
| Gateway | Factory returning `gateway<I>` |
| External resource | API factory over an HTTP client, returns DTOs |
| Use case | Hook returning `UseCase<T>`, or inline handler |
| Selector | Hook |
| Presenter | Hook, or inline projection |
| Controller | Hook, or inline handlers |
| `presenter<I>`, `controller<I>` | `Presenter`, `Controller` interfaces of the component |
| User interface | Component JSX |

## Decisions

**Component function is the composition root.** It composes its units through
hooks and renders the user interface. Units that are still inline are marked
with comments:

```tsx
export const Order: FC<OrderParams> = (props) => {
  // presenter
  const presenter = usePresenter(props);

  // controller
  const controller = useController(props);

  // user interface
  return <button onClick={controller.deleteOrderButtonClicked} />;
};
```

**Extracted units are hooks** (`use<Name>Selector`, `use<Name>UseCase`,
`usePresenter`, `useController`). Extract only when a unit is reused, hard to
read inline or needs its own tests.

**Self-contained components.** Props carry only identity or configuration
(`orderId`), never entity data. Each component resolves its data through its
own selectors.

**Presenter** returns plain ViewModel values, with safe defaults while data is
unavailable. It reads only selectors and doesn't mutate anything.

**Controller** returns handlers that delegate to a use case. When a decision
needs state, it reads entities through selectors, never presenter values.

**Use case** hook returns `UseCase<T>` (`{ execute(params: T): Promise<void> }`).
It owns orchestration and the error boundary. It calls the repository mutation
with `.unwrap()` inside `try/catch`.

**Selectors** wrap repository or store hooks and compose each other. The
pending state of a mutation is shared between the use case and selectors
through RTK Query's `fixedCacheKey`.

**Application business entity** is a Redux slice. Slice reducers are the
transitions between valid states.

**Repository** is an RTK Query `createApi` with `fakeBaseQuery()`. Each
endpoint's `queryFn` resolves a gateway and calls it. Cache and invalidation
use tags. Optimistic updates and rollback go in `onQueryStarted`
(`updateQueryData` + `patchResult.undo()`). The repository consumes
`gateway<I>` and never defines it.

**Gateway** is a factory of plain functions implementing `gateway<I>`, so
implementations can be swapped (in-memory, remote). It maps DTOs to entities.

**External resource** returns DTOs and knows nothing about entities.

The sample has no separate transaction or effect units. Entity transitions
live in slice reducers and `updateQueryData` recipes. Gateway I/O is in the
repository's `queryFn`.
