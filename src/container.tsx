import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { throttle } from './utils';
import { PartialOptions, OptionKeys, OptionKey } from './config';
import { ScrollIntoViewAPI } from './api';
import { APIConsumer } from './context';

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

// Modern functional ContainerBase with proper previous value tracking and default props
export const ContainerBase = React.forwardRef<View, ContainerProps>((props, ref) => {
    // Default props
    const {
        enabled = true,
        animated = true,
        immediate = false,
        onMount = true,
        onUpdate = true,
        scrollIntoViewKey,
        scrollIntoViewOptions,
        scrollIntoViewAPI,
        children,
        ...rest
    } = props;

    const container = React.useRef<View>(null);
    const unmounted = React.useRef(false);

    // Track previous values for enabled and scrollIntoViewKey
    const prevEnabled = React.useRef<boolean | undefined>(enabled);
    const prevScrollIntoViewKey = React.useRef<typeof scrollIntoViewKey>(scrollIntoViewKey);

    React.useEffect(() => {
        prevEnabled.current = enabled;
        prevScrollIntoViewKey.current = scrollIntoViewKey;
    }, [enabled, scrollIntoViewKey]);

    const ensureApiProvided = React.useCallback(() => {
        if (scrollIntoViewAPI) {
            return true;
        } else {
            showNotInContextWarning();
            return false;
        }
    }, [scrollIntoViewAPI]);

    const getPropsOptions = React.useCallback(() => {
        const options: PartialOptions = {
            ...scrollIntoViewOptions
        };
        OptionKeys.forEach((optionKey: OptionKey) => {
            const optionValue = (props as any)[optionKey];
            if (typeof optionValue !== 'undefined') {
                options[optionKey] = optionValue;
            }
        });
        return options;
    }, [scrollIntoViewOptions, props]);

    const scrollIntoView = React.useCallback(
        (providedOptions: PartialOptions = {}) => {
            if (unmounted.current) {
                return;
            }
            if (ensureApiProvided()) {
                const options = {
                    ...getPropsOptions(),
                    ...providedOptions
                };
                scrollIntoViewAPI!.scrollIntoView(container.current!, options);
            }
        },
        [ensureApiProvided, getPropsOptions, scrollIntoViewAPI]
    );

    React.useEffect(() => {
        setTimeout(() => {
            onMount && enabled && scrollIntoView();
        }, 0);
        return () => {
            unmounted.current = true;
        };
    }, []);

    React.useEffect(() => {
        // Only run on updates
        const hasBeenEnabled = enabled && !prevEnabled.current;
        if (onUpdate && hasBeenEnabled) {
            scrollIntoView();
            return;
        }
        const keyHasChanged = scrollIntoViewKey !== prevScrollIntoViewKey.current;
        if (onUpdate && enabled && keyHasChanged) {
            scrollIntoView();
            return;
        }
    }, [enabled, onUpdate, scrollIntoViewKey, scrollIntoView]);

    return (
        <View {...rest} ref={ref || container} collapsable={false}>
            {children}
        </View>
    );
});

ContainerBase.displayName = 'ContainerBase';

export const Container = React.forwardRef<View, ContainerProps>((props, ref) => (
    <APIConsumer>
        {(scrollIntoViewAPI) =>
            scrollIntoViewAPI ? <ContainerBase ref={ref} {...props} scrollIntoViewAPI={scrollIntoViewAPI} /> : null
        }
    </APIConsumer>
));
