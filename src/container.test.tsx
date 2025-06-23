import React from 'react';
import { View } from 'react-native';

import { act, render } from '@testing-library/react-native';

import { Container, ContainerBase } from './container';
import Context from './context';

import type { ScrollIntoViewAPI } from './api';

const mockScrollIntoView = jest.fn();
const mockScrollIntoViewAPIInstance = {
    scrollIntoView: mockScrollIntoView
} as unknown as ScrollIntoViewAPI;

let consoleWarnSpy: jest.SpyInstance;

// Mock throttle to call the function immediately for testing
jest.mock('./utils', () => ({
    ...jest.requireActual('./utils'),
    throttle: jest.fn((fn) => fn)
}));

describe('ContainerBase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers(); // For managing setTimeout in useEffect
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.runOnlyPendingTimers(); // Ensure all timers are cleared before next test
        jest.useRealTimers();
        consoleWarnSpy.mockRestore();
    });

    it('renders children', () => {
        const { getByTestId } = render(
            <ContainerBase scrollIntoViewAPI={mockScrollIntoViewAPIInstance}>
                <View testID="child-view" />
            </ContainerBase>
        );
        expect(getByTestId('child-view')).toBeTruthy();
    });

    it('calls scrollIntoView on mount if onMount and enabled are true', () => {
        render(<ContainerBase scrollIntoViewAPI={mockScrollIntoViewAPIInstance} onMount={true} enabled={true} />);
        act(() => {
            jest.runAllTimers(); // For the setTimeout in onMount useEffect
        });
        expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    });

    it('does not call scrollIntoView on mount if onMount is false', () => {
        render(<ContainerBase scrollIntoViewAPI={mockScrollIntoViewAPIInstance} onMount={false} enabled={true} />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('does not call scrollIntoView on mount if enabled is false', () => {
        render(<ContainerBase scrollIntoViewAPI={mockScrollIntoViewAPIInstance} onMount={true} enabled={false} />);
        act(() => {
            jest.runAllTimers();
        });
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('calls scrollIntoView on update when enabled changes to true', () => {
        const { rerender } = render(
            <ContainerBase scrollIntoViewAPI={mockScrollIntoViewAPIInstance} onUpdate={true} enabled={false} />
        );
        // Clear mock calls from any potential onMount trigger if defaults were different
        mockScrollIntoView.mockClear();
        rerender(<ContainerBase scrollIntoViewAPI={mockScrollIntoViewAPIInstance} onUpdate={true} enabled={true} />);
        expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    });

    it('calls scrollIntoView on update when scrollIntoViewKey changes and enabled is true', () => {
        const { rerender } = render(
            <ContainerBase
                scrollIntoViewAPI={mockScrollIntoViewAPIInstance}
                onUpdate={true}
                enabled={true}
                scrollIntoViewKey="key1"
            />
        );
        act(() => {
            // Process the onMount call
            jest.runAllTimers();
        });
        mockScrollIntoView.mockClear();

        rerender(
            <ContainerBase
                scrollIntoViewAPI={mockScrollIntoViewAPIInstance}
                onUpdate={true}
                enabled={true}
                scrollIntoViewKey="key2"
            />
        );
        expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    });

    it('does not call scrollIntoView on update if onUpdate is false', () => {
        const { rerender } = render(
            <ContainerBase
                scrollIntoViewAPI={mockScrollIntoViewAPIInstance}
                onUpdate={false}
                enabled={false}
                scrollIntoViewKey="key1"
            />
        );
        mockScrollIntoView.mockClear();
        rerender(
            <ContainerBase
                scrollIntoViewAPI={mockScrollIntoViewAPIInstance}
                onUpdate={false}
                enabled={true}
                scrollIntoViewKey="key2"
            />
        );
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('calls scrollIntoView with merged options from props and scrollIntoViewOptions', () => {
        render(
            <ContainerBase
                scrollIntoViewAPI={mockScrollIntoViewAPIInstance}
                onMount={true}
                enabled={true}
                animated={false}
                scrollIntoViewOptions={{ immediate: true }}
            />
        );
        act(() => {
            jest.runAllTimers();
        });
        expect(mockScrollIntoView).toHaveBeenCalledWith(
            expect.anything(), // The container ref
            expect.objectContaining({ animated: false, immediate: true })
        );
    });

    it('warns if scrollIntoViewAPI is not provided and scroll is attempted', () => {
        const { rerender } = render(
            <ContainerBase
                onMount={true}
                enabled={true}
                // No scrollIntoViewAPI provided
            />
        );
        act(() => {
            jest.runAllTimers(); // Attempt onMount scroll
        });
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('ScrollIntoView API is not provided'));
        expect(mockScrollIntoView).not.toHaveBeenCalled(); // Ensure actual scroll didn't happen

        consoleWarnSpy.mockClear();
        mockScrollIntoView.mockClear();

        rerender(
            <ContainerBase
                onUpdate={true}
                enabled={true}
                scrollIntoViewKey="newKey"
                // No scrollIntoViewAPI provided
            />
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('ScrollIntoView API is not provided'));
        expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('passes other ViewProps to the underlying View', () => {
        const { getByTestId } = render(
            <ContainerBase
                scrollIntoViewAPI={mockScrollIntoViewAPIInstance}
                testID="my-container"
                style={{ backgroundColor: 'red' }}
            />
        );
        const viewElement = getByTestId('my-container');
        expect(viewElement.props.style).toEqual({ backgroundColor: 'red' });
    });

    it('forwards ref to the underlying View', () => {
        const ref = React.createRef<View>();
        render(<ContainerBase scrollIntoViewAPI={mockScrollIntoViewAPIInstance} ref={ref} />);
        expect(ref.current).toBeTruthy();
    });
});

describe('Container', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    it('renders ContainerBase with API from context', () => {
        const { getByTestId } = render(
            <Context.Provider value={mockScrollIntoViewAPIInstance}>
                <Container>
                    <View testID="child-in-container" />
                </Container>
            </Context.Provider>
        );
        expect(getByTestId('child-in-container')).toBeTruthy();
    });

    it('renders nothing if API is not in context', () => {
        const { queryByTestId } = render(
            // No Context.Provider, so context value will be null, and Container renders nothing
            <Container>
                <View testID="child-in-container" />
            </Container>
        );
        expect(queryByTestId('child-in-container')).toBeNull();
    });
});
