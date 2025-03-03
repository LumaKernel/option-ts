# option-ts

Rust-like interface Option class.

# Example

```ts
const v = Option.fromNullish(
  await fetchSomething(), /* which returns { something: number } | null */
);
const maybeSomething = v.map((e) => e.something);
const unwrapped = maybeSomething.unwrapOr(Number.NaN);
```

# Is there .flatMap() method?

Use `.andThen()` instead.

# How to work on async works only when the value is some?

We may want to something like following intuitively in Rust.

```rust
match v {
    Some(v) => {
        v.work.await;
    }
    _ => {}
}
```

But yes, that couldn't be possible even if using `.match()`. Instead you can do
that as following.

```ts
await v.andThen(async (v) => await v.work()).awaited();
```

The method `.awaited()` converts from `Option<Promise<T>>` into
`Promise<Option<T>>`.
