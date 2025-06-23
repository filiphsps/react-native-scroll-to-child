import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { APIConsumer } from './context';
import { throttle } from './utils';

import type { ScrollIntoViewAPI } from './api';
import type { PartialOptions } from './config';
import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

const showNotInContextWarning = throttle(() => {
    console.warn(
        'ScrollIntoView API is not provided in React context. Make sure you wrapped your ScrollView component with wrapScrollView(ScrollView)'
    );
}, 5000);

type ContainerProps = {
    enabled?: boolean;
    scrollIntoViewKey?: string | number | boolean;
    animated?: boolean;
    immediate?: boolean;
    onMount?: boolean;
    onUpdate?: boolean;
    scrollIntoViewOptions?: PartialOptions;
    scrollIntoViewAPI?: ScrollIntoViewAPI;
    children?: ReactNode;
} & PartialOptions &
    ViewProps;

export const ContainerBase = forwardRef<View, ContainerProps>((props, ref) => {
    const {
        enabled = true,
        onMount = true,
        onUpdate = true,
        scrollIntoViewKey,
        scrollIntoViewOptions,
        scrollIntoViewAPI,
        children,
        align,
        animated,
        immediate,
        insets,
        measureElement,
        computeScrollY,
        computeScrollX,
        ...rest
    } = props;

    const containerRef = useRef<View>(null);
    const unmounted = useRef(false);
    const prevProps = useRef({ enabled, scrollIntoViewKey });

    const ensureApiProvided = useCallback(() => {
        if (!scrollIntoViewAPI) {
            showNotInContextWarning();
            return false;
        }
        return true;
    }, [scrollIntoViewAPI]);

    const getPropsOptions = useCallback(() => {
        const COMPONENT_DEFAULT_ANIMATED = true;
        const COMPONENT_DEFAULT_IMMEDIATE = false;

        const mergedOptions: PartialOptions = {
            animated: COMPONENT_DEFAULT_ANIMATED,
            immediate: COMPONENT_DEFAULT_IMMEDIATE,
            ...scrollIntoViewOptions
        };

        const optionProps: (keyof PartialOptions)[] = [
            'animated',
            'immediate',
            'align',
            'insets',
            'measureElement',
            'computeScrollY',
            'computeScrollX'
        ];

        const propsToMerge = {
            animated,
            immediate,
            align,
            insets,
            measureElement,
            computeScrollY,
            computeScrollX
        };

        for (const key of optionProps) {
            if (propsToMerge[key] !== undefined) {
                (mergedOptions as any)[key] = propsToMerge[key];
            }
        }

        return mergedOptions;
    }, [scrollIntoViewOptions, animated, immediate, align, insets, measureElement, computeScrollY, computeScrollX]);

    const scrollIntoView = useCallback(
        (providedOptions: PartialOptions = {}) => {
            if (unmounted.current || !ensureApiProvided()) return;
            const currentContainerRef = containerRef.current;
            if (!currentContainerRef) return;
            const options = { ...getPropsOptions(), ...providedOptions };
            if (scrollIntoViewAPI) {
                scrollIntoViewAPI.scrollIntoView(currentContainerRef, options);
            }
        },
        [ensureApiProvided, getPropsOptions, scrollIntoViewAPI]
    );

    useEffect(() => {
        let timerId: number | undefined;
        if (onMount && enabled) {
            timerId = setTimeout(() => {
                if (!unmounted.current) {
                    scrollIntoView();
                }
            }, 0);
        }
        return () => {
            if (timerId) {
                clearTimeout(timerId);
            }
        };
    }, [enabled, onMount, scrollIntoView]);

    useEffect(() => {
        const prevEnabled = prevProps.current.enabled;
        const prevKey = prevProps.current.scrollIntoViewKey;

        // Determine if an update scroll is needed
        // Scroll if onUpdate is true, component is currently enabled, AND
        // (it was previously disabled OR the key changed while it was enabled)
        const needsUpdateScroll = onUpdate && enabled && (!prevEnabled || scrollIntoViewKey !== prevKey);

        if (needsUpdateScroll) {
            scrollIntoView();
        }

        // Update prevProps.current for the next render/effect cycle if relevant props changed.
        // This ensures that for the *next* run of this effect, prevProps.current has the values from the end of *this* run.
        if (prevEnabled !== enabled || prevKey !== scrollIntoViewKey) {
            prevProps.current = { enabled, scrollIntoViewKey };
        }
    }, [enabled, onUpdate, scrollIntoViewKey, scrollIntoView]);

    useEffect(() => {
        return () => {
            unmounted.current = true;
        };
    }, []);

    return (
        <View {...rest} ref={ref || containerRef} collapsable={false}>
            {children}
        </View>
    );
});

ContainerBase.displayName = 'ContainerBase';

export const Container = forwardRef<View, ContainerProps>((props, ref) => (
    <APIConsumer>
        {(apiFromContext) =>
            apiFromContext && <ContainerBase ref={ref} {...props} scrollIntoViewAPI={apiFromContext} />
        }
    </APIConsumer>
));
