import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Animated } from 'react-native';

import { normalizeHOCConfig, normalizeOptions } from './config';
import { ProvideAPI } from './context';

import type { ScrollIntoViewDependencies } from './api';
import type { PartialHOCConfig, PartialOptions } from './config';
import type { ComponentType } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

type ScrollViewProps = React.ComponentProps<typeof ScrollView>;
type ScrollViewScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

type HOCProps = ScrollViewProps & {
    scrollIntoViewOptions?: PartialOptions;
    scrollEventThrottle?: number;
    contentOffset?: { x: number; y: number };
    ref?: React.RefObject<ScrollView | null>;
};

export type WrappableScrollView = ComponentType<ScrollViewProps>;
export type WrappedScrollView = ComponentType<HOCProps>;

export const wrapScrollViewHOC = (
    ScrollViewComp: WrappableScrollView,
    config: PartialHOCConfig = {}
): WrappedScrollView => {
    const { getScrollViewNode, scrollEventThrottle, options } = normalizeHOCConfig(config);

    const ScrollViewWrapper = forwardRef<ScrollView, HOCProps>((props, ref) => {
        const internalRef = useRef<ScrollView>(null);
        const scrollY = useRef(props.contentOffset?.y || 0);
        const scrollX = useRef(props.contentOffset?.x || 0);

        const handleScroll = useCallback((event: ScrollViewScrollEvent) => {
            scrollY.current = event.nativeEvent.contentOffset.y;
            scrollX.current = event.nativeEvent.contentOffset.x;
        }, []);

        const dependencies: ScrollIntoViewDependencies = {
            getScrollView: () => {
                if (!internalRef.current) throw new Error('ScrollView ref is not set');
                return getScrollViewNode(internalRef.current);
            },
            getScrollY: () => scrollY.current,
            getScrollX: () => scrollX.current,
            getDefaultOptions: () => normalizeOptions(props.scrollIntoViewOptions, options)
        };

        useImperativeHandle(ref, () => internalRef.current!, []);

        const scrollViewProps = {
            ...props,
            ref: internalRef,
            scrollEventThrottle: props.scrollEventThrottle || scrollEventThrottle,
            onScroll: (Animated as any).forkEvent(props.onScroll, handleScroll)
        };

        return (
            <ScrollViewComp {...scrollViewProps}>
                <ProvideAPI dependencies={dependencies}>{props.children}</ProvideAPI>
            </ScrollViewComp>
        );
    });

    ScrollViewWrapper.displayName = `ScrollIntoViewWrapper(${ScrollViewComp.displayName || ScrollViewComp.name || 'Component'})`;

    return ScrollViewWrapper;
};
