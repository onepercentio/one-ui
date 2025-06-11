# Protecting an async function
```tsx
const control = useAsyncControl()

control.process(() => anAsyncFunction());
```

# Using an async function directly
```tsx
const control = useAsyncControl({anAsyncFunction})

control.anAsyncFunction();
```