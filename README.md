# react-native-scroll-to-child

[![npm downloads](https://img.shields.io/npm/dm/react-native-scroll-to-child.svg)](https://www.npmjs.com/package/react-native-scroll-to-child)
[![npm version](https://img.shields.io/npm/v/react-native-scroll-to-child.svg?style=flat)](https://www.npmjs.com/package/react-native-scroll-to-child)
[![GitHub checks](https://img.shields.io/github/checks-status/filiphsps/react-native-scroll-to-child/master.svg?style=flat)](https://github.com/filiphsps/react-native-scroll-to-child)

Scroll a ReactNative View ref into the visible portion of a `ScrollView`.

```bash
pnpm install react-native-scroll-to-child
```

---

# Why fork?

The [original project](https://github.com/slorber/react-native-scroll-into-view) ain't really maintained anymore and I needed horizontal scroll support. I might decide to rewrite some of the more dated parts in the future; but for now this works well enough.

# Features:

- Declarative component API
- Imperative hook API
- Configurable at many levels
- Different alignment modes
- Insets
- Supports **both** vertical and horizontal ScrollViews.
- Typescript definitions
- Support for composition/refs/other ScrollView wrappers (`Animated.ScrollView`, `react-native-keyboard-aware-scroll-view`, `glamorous-native`...)

# Minimal hooks example

```tsx
import { View, Text, ScrollView } from 'react-native';
import {
  wrapScrollView,
  useScrollIntoView,
} from 'react-native-scroll-to-child';

const CustomScrollView = wrapScrollView(ScrollView);

function MyScreen() {
  return (
    <CustomScrollView>
      <MyScreenContent />
    </CustomScrollView>
  );
}

function MyScreenContent() {
  const scrollIntoView = useScrollIntoView();
  const viewRef = useRef();
  return (
    <>
      <Button onPress={() => scrollIntoView(viewRef.current)}>
        Scroll a view ref into view
      </Button>
      // in android if the scroll is not working then add renderToHardwareTextureAndroid this to view
      <View style={{ height: 100000 }}>
        <Text>Some long ScrollView content</Text>
      </View>

      <View ref={viewRef}>
        <Text>Will be scrolled into view on button press</Text>
      </View>
    </>
  );
}
```

# API

```tsx
import {
  ScrollIntoView, // enhanced View container
  wrapScrollView, // simple wrapper, no config
  wrapScrollViewConfigured, // complex wrapper, takes a config
  useScrollIntoView, // access hook for imperative usage
} from 'react-native-scroll-to-child';

// Available options with their default value
const options = {
  // auto: ensure element appears fully inside the view (if not already inside). It may align to top or bottom.
  // start: align element to the top or to the left
  // end: align element to the bottom or to the right
  // center: align element at the center of the view
  align: 'auto',

  // Animate the scrollIntoView() operation
  animated: true,

  // By default, scrollIntoView() calls are throttled a bit because it does not make much sense
  // to scrollIntoView() 2 elements at the same time (and sometimes even impossible)
  immediate: false,

  // Permit to add top/bottom insets so that element scrolled into view
  // is not touching directly the borders of the scrollview (like a padding)
  insets: {
    top: 0,
    bottom: 0,
  },

  // Advanced: use these options as escape hatches if the lib default functions do not satisfy your needs
  computeScrollY: (scrollViewLayout, viewLayout, scrollY, insets, align) => {},
  computeScrollX: (scrollViewLayout, viewLayout, scrollX, insets, align) => {},
  measureElement: viewRef => {},
};

// Wrap the original ScrollView
const CustomScrollView = wrapScrollView(ScrollView);

// Use the wrapped CustomScrollView as a replacement of ScrollView
function MyScreen() {
  return (
    <CustomScrollView
      // Can provide default options (overrideable)
      scrollIntoViewOptions={scrollIntoViewOptions}
    >
      <ScreenContent />
    </CustomScrollView>
  );
}

// Implement ScreenContent (inner of the ScrollView) with the useScrollIntoView and refs
function ScreenContent() {
  const scrollIntoView = useScrollIntoView();
  const viewRef = useRef();

  return (
    <>
      <Button
        onPress={() => {
          scrollIntoView(viewRef.current, options);
        }}
      >
        Scroll a view ref into view
      </Button>

      <View style={{ height: 100000 }}>
        <Text>Some long ScrollView content</Text>
      </View>

      <View ref={viewRef}>
        <Text>Will be scrolled into view on button press</Text>
      </View>
    </>
  );
}
```

You can also configure the HOC:

```tsx
const CustomScrollView = wrapScrollViewConfigured({
  // SIMPLE CONFIG:
  // ScrollIntoView default/fallback options
  options: scrollIntoViewOptions,

  // ADVANCED CONFIG:
  // Use this if you use a ScrollView wrapper that does not use React.forwardRef()
  refPropName: 'ref',
  // unwraps the ref that the wrapped ScrollView gives you (this lib need the bare metal ScrollView ref)
  getScrollViewNode: ref => ref,
  // fallback value for throttling, can be overriden by user with props
  scrollEventThrottle: 16,
})(ScrollView);
```

All these hoc configurations can also be provided to the `CustomScrollView` as props.

# License

MIT

Some code is inspired from contribution of @sebasgarcep of an initial scrollIntoView support for [react-native-keyboard-aware-scroll-view](https://github.com/APSL/react-native-keyboard-aware-scroll-view)
