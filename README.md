Install via npm:

```bash
npm install @onepercentio/one-ui
```

Or include it directly in HTML:

```html
<script src="https://github.com/onepercentio/one-ui/releases/download/v1.3.5/bundle.js"></script>
```

When loaded via script in HTML, the library is exposed as the global `OneUI` object:

```tsx
function App() {
    return (
        <OneUI.Button type="button">
            Hello from OneUI
        </OneUI.Button>
    );
}
```