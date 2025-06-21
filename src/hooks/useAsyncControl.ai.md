# Protecting an async function
```tsx
const control = useAsyncControl()

control.process(() => anAsyncFunction());
```

# Using multiple async functions
```tsx
const control = useAsyncControl({
    asyncFunctionOne,
    asyncFunctionTwo,
})

control.asyncFunctionOne();
control.asyncFunctionTwo();
```

# Storing data
```tsx
const [result, setResult] = useState()
const control = useAsyncControl({anAsyncFunctionThatReturnsData})

control.anAsyncFunctionThatReturnsData().then(setResult);
```