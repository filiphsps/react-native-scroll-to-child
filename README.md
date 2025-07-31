# react-native-scroll-to-child

Programmatically scroll a React Native `ScrollView`'s child into view, either vertically, horizontally, or both.

[![npm downloads](https://img.shields.io/npm/dm/react-native-scroll-to-child.svg)](https://www.npmjs.com/package/react-native-scroll-to-child)
[![npm version](https://img.shields.io/npm/v/react-native-scroll-to-child.svg?style=flat)](https://www.npmjs.com/package/react-native-scroll-to-child)
[![CI](https://img.shields.io/github/actions/workflow/status/filiphsps/react-native-scroll-to-child/ci.yml)](https://github.com/filiphsps/react-native-scroll-to-child/actions/workflows/ci.yml)
[![codecov](https://img.shields.io/codecov/c/github/filiphsps/react-native-scroll-to-child?token=wTfrpJQEhV)](https://codecov.io/gh/filiphsps/react-native-scroll-to-child)

> [!NOTE]
> **Why a hard-fork?** The [original project](https://github.com/slorber/react-native-scroll-into-view) is not actively maintained, and I needed to add support for horizontal scrolling. This fork also aims to improve code readability and modernization. If you find this package useful, please consider starring the original repository as well!


## Installation

```bash
pnpm install react-native-scroll-to-child
```

## Features

- **Declarative Component API:** Use the `<ScrollIntoView />` component for a straightforward approach.
- **Imperative Hook API:** Access `useScrollIntoView()` for more complex, event-driven scrolling.
- **Highly Configurable:** Customize scroll behavior at multiple levels.
- **Alignment Modes:** Control where the element aligns within the `ScrollView` (`auto`, `start`, `end`, `center`).
- **Insets:** Add top and bottom insets to prevent elements from touching the `ScrollView` edges.
- **Horizontal & Vertical:** Works for both vertical and horizontal `ScrollView`s.
- **TypeScript Support:** Fully typed for a better development experience.
- **Composition Friendly:** Supports `Animated.ScrollView`, `react-native-keyboard-aware-scroll-view`, and other `ScrollView` wrappers.

## Examples

### Declarative Component

This is the simplest way to use the library. Wrap the child you want to scroll to in the `ScrollIntoView` component and control its state with a boolean.

```tsx
import { View, Text, ScrollView, Button } from 'react-native';
import { wrapScrollView, ScrollIntoView } from 'react-native-scroll-to-child';
import { useState } from 'react';

const CustomScrollView = wrapScrollView(ScrollView);

function MyScreen() {
    const [show, setShow] = useState(false);

    return (
        <CustomScrollView>
            <Button title="Scroll to View" onPress={() => setShow(true)} />
            <View style={{ height: 1000 }} />
            <ScrollIntoView show={show}>
                <Text>This view will be scrolled into view!</Text>
            </ScrollIntoView>
        </CustomScrollView>
    );
}
```

### Imperative Hook

For more control, you can use the `useScrollIntoView` hook to scroll a `ref` into view imperatively.

```tsx
import { View, Text, ScrollView, Button, Alert } from 'react-native';
import { wrapScrollView, useScrollIntoView } from 'react-native-scroll-to-child';
import { useRef } from 'react';

const CustomScrollView = wrapScrollView(ScrollView);

function MyScreen() {
    return (
        <CustomScrollView>
            <MyScreenContent />
        </CustomScrollView>
    );
}

function MyScreenContent() {
    const viewRef = useRef<View>(null);
    const scrollIntoView = useScrollIntoView();

    const handlePress = () => {
        if (viewRef.current) {
            scrollIntoView(viewRef.current, {
                align: 'center',
                animated: true,
            });
        } else {ß
            Alert.alert("Error", "The view isn't mounted yet.");
        }
    };

    return (
        <>
            <Button onPress={handlePress} title="Scroll to View" />
            <View style={{ height: 1000 }}>
                <Text>Some long ScrollView content</Text>
            </View>
            <View ref={viewRef}>
                <Text>This view will be scrolled into view on button press!</Text>
            </View>
        </>
    );
}
```

## API

### `wrapScrollView(ScrollViewComponent, options?)` Higher-Order Component (HOC)

This higher-order component wraps your `ScrollView` to provide the necessary context for scrolling.

- `ScrollViewComponent`: The `ScrollView` component to wrap (e.g., `ScrollView`, `Animated.ScrollView`).
- `options` (optional): Default options for all `scrollIntoView` calls within this `ScrollView`.

### `useScrollIntoView()` Hook

A hook that returns the `scrollIntoView` function.

- `scrollIntoView(ref, options?)`: Scrolls the given `ref` into view.
  - `ref`: A `ref` to the component you want to scroll to.
  - `options` (optional): Override the default options for this specific call.

### `ScrollIntoView` Component

A component that wraps a child and scrolls it into view based on the `show` prop.

- `show`: A boolean that, when `true`, scrolls the child into view.
- `options` (optional): Override the default options for this component.


<details>
<summary><h4><code>ScrollIntoView</code> Options</h4></summary>

| Option             | Type                                                               | Default      | Description                                                                                             |
| ------------------ | ------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------- |
| `align`            | `'auto'`, `'start'`, `'end'`, `'center'`                           | `'auto'`     | Determines the alignment of the element within the `ScrollView`.                                        |
| `animated`         | `boolean`                                                          | `true`       | Whether to animate the scroll.                                                                          |
| `immediate`        | `boolean`                                                          | `false`      | If `true`, the call is not throttled. Useful for high-priority scrolls.                                 |
| `insets`           | `{ top: number, bottom: number, left: number, right: number }`     | `{...}`      | Adds padding around the element when scrolling it into view.                                            |
| `computeScrollY`   | `(scrollViewLayout, viewLayout, scrollY, insets, align) => number` | `undefined`  | Advanced: Override the default vertical scroll calculation.                                             |
| `computeScrollX`   | `(scrollViewLayout, viewLayout, scrollX, insets, align) => number` | `undefined`  | Advanced: Override the default horizontal scroll calculation.                                           |
| `measureElement`   | `(viewRef) => Promise<LayoutRectangle>`                            | `undefined`  | Advanced: Override how the element's layout is measured.                                                |
</details>

### Advanced Usage

You can provide custom configuration to `wrapScrollView` for advanced use cases, such as when using a custom `ScrollView` wrapper.

```tsx
// All HOC configurations can also be passed as props to the wrapped `ScrollView` component.

const CustomScrollView = wrapScrollView(MyCustomScrollView, {
  // Provide default options for all scroll calls
  options: {
    align: 'center',
  },
  // If your custom ScrollView nests the underlying ScrollView,
  // provide a function to extract the actual ScrollView node.
  getScrollViewNode: ref => ref.getScrollView(),
  // Set a default throttle value for scroll events.
  scrollEventThrottle: 16,
});
```
