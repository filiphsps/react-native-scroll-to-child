import { Platform } from 'react-native';

import { computeScrollX, computeScrollY } from './compute-scroll';
import { measureElement } from './utils';

import type { ScrollView } from 'react-native';

export type Insets = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

export type Align = 'auto' | 'start' | 'end' | 'center';

export type FullOptions = {
    align: Align;
    animated: boolean;
    immediate: boolean;
    insets: Insets;
    computeScrollY: typeof computeScrollY;
    computeScrollX: typeof computeScrollX;
    measureElement: typeof measureElement;
};

export type PartialOptions = Partial<FullOptions>;

export const DefaultOptions: FullOptions = {
    align: 'auto',
    animated: true,
    immediate: false,
    insets: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    computeScrollY,
    computeScrollX,
    measureElement
};

export type OptionKey = keyof FullOptions;
export const OptionKeys: OptionKey[] = Object.keys(DefaultOptions) as OptionKey[];

export const normalizeOptions = (options: PartialOptions = {}, fallbackOptions: FullOptions = DefaultOptions) => ({
    ...fallbackOptions,
    ...options,
    insets: {
        ...fallbackOptions.insets,
        ...options.insets
    }
});

export type FullHOCConfig = {
    refPropName: string;
    getScrollViewNode: (scrollView: ScrollView) => ScrollView;
    scrollEventThrottle: 16;
    options: PartialOptions;
};
export type PartialHOCConfig = Partial<FullHOCConfig>;

export const DefaultHOCConfig: FullHOCConfig = {
    // The ref propName to pass to the wrapped component
    // If you use something like glamorous-native, you can use "innerRef" for example
    refPropName: 'ref',
    // The method to extract the raw scrollview node from the ref we got, if it's not directly the scrollview itself
    getScrollViewNode: (scrollView: ScrollView) => {
        // scrollView.getNode() was used for Animated.ScrollView components but is deprecated since RN 0.62.
        // See: https://github.com/facebook/react-native/commit/66e72bb4e00aafbcb9f450ed5db261d98f99f82a
        // We only attempt to call it if it exists and we're on an older RN version.
        const rnVersion = Platform.constants.reactNativeVersion;
        const isPreRN062 = (rnVersion as any) ? rnVersion.major === 0 && rnVersion.minor < 62 : false;

        // Check if getNode exists on the scrollView object (common for Animated.ScrollView)
        // and if we are on a React Native version where it was recommended.
        if (typeof (scrollView as any).getNode === 'function' && isPreRN062) {
            return (scrollView as any).getNode(); // Call getNode if applicable
        }
        return scrollView; // Otherwise, return the scrollView directly
    },
    // Default value for throttling, can be overriden by user with props
    scrollEventThrottle: 16,
    // ScrollIntoView options, can be offeriden by <ScrollIntoView> comp or imperative usage
    options: DefaultOptions
};

export const normalizeHOCConfig = (config: PartialHOCConfig = {}) => ({
    ...DefaultHOCConfig,
    ...config,
    options: normalizeOptions(config.options, DefaultOptions)
});
