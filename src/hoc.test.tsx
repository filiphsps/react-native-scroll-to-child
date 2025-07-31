import { describe, expect, it } from '@jest/globals';

import React from 'react';
import { ScrollView, Text } from 'react-native';

import { render } from '@testing-library/react-native';

import { ScrollIntoViewAPI } from './api';
import Context from './context';
import { wrapScrollViewHOC } from './hoc';

// Test helper component
const createContextReader = () => {
    let api: ScrollIntoViewAPI | null = null;
    const ContextReader = () => {
        api = React.useContext(Context);
        return null;
    };
    return { ContextReader, getApi: () => api };
};

describe('wrapScrollViewHOC', () => {
    it('should render children and provide scroll into view context', () => {
        const WrappedScrollView = wrapScrollViewHOC(ScrollView);
        const contextReader = createContextReader();

        const { getByText } = render(
            <WrappedScrollView>
                <Text>Child Component</Text>
                <contextReader.ContextReader />
            </WrappedScrollView>
        );

        expect(getByText('Child Component')).toBeTruthy();
        expect(contextReader.getApi()).toBeInstanceOf(ScrollIntoViewAPI);
    });

    it('should forward ref to the underlying ScrollView', () => {
        const WrappedScrollView = wrapScrollViewHOC(ScrollView);
        const ref = React.createRef<ScrollView>();
        render(<WrappedScrollView ref={ref} />);
        expect(ref.current).toBeTruthy();
    });

    it('should set a descriptive displayName on the wrapped component', () => {
        const MyScrollView = (props: React.ComponentProps<typeof ScrollView>) => <ScrollView {...props} />;
        MyScrollView.displayName = 'MyScrollView';
        const Wrapped = wrapScrollViewHOC(MyScrollView);
        expect(Wrapped.displayName).toBe('ScrollIntoViewWrapper(MyScrollView)');
    });

    it('should handle components without a displayName', () => {
        const NamelessComponent = (props: React.ComponentProps<typeof ScrollView>) => <ScrollView {...props} />;
        const Wrapped = wrapScrollViewHOC(NamelessComponent);
        expect(Wrapped.displayName).toBe(`ScrollIntoViewWrapper(${NamelessComponent.name || 'Component'})`);
    });

    it('should support custom getScrollViewNode', () => {
        const customNode = {};
        const getScrollViewNode = jest.fn().mockReturnValue(customNode);
        const Wrapped = wrapScrollViewHOC(ScrollView, { getScrollViewNode });
        const contextReader = createContextReader();

        render(
            <Wrapped>
                <contextReader.ContextReader />
            </Wrapped>
        );

        expect(contextReader.getApi()).toBeTruthy();
    });
});
