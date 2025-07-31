import { describe, expect, it } from '@jest/globals';

import React from 'react';

import { renderHook } from '@testing-library/react-native';

import Context from './context';
import { useScrollIntoView } from './hooks';

import type { ScrollIntoViewAPI } from './api';

describe('useScrollIntoView', () => {
    it('should return the scrollIntoView function from context', () => {
        const mockScrollIntoView = jest.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <Context.Provider
                value={
                    // Use 'as any as ScrollIntoViewAPI' to satisfy the type for the mock
                    // as we are only interested in the scrollIntoView method for this test.
                    { scrollIntoView: mockScrollIntoView } as any as ScrollIntoViewAPI
                }
            >
                {children}
            </Context.Provider>
        );

        const { result } = renderHook(() => useScrollIntoView(), { wrapper });
        expect(result.current).toBe(mockScrollIntoView);
    });

    it('should throw an error if context is not provided', () => {
        // Suppress console.error for this test as an error is expected
        const originalError = console.error;
        console.error = jest.fn();

        expect(() => {
            renderHook(() => useScrollIntoView());
        }).toThrow(
            'ScrollIntoView context is missing. Ensure your ScrollView is wrapped with wrapScrollView() and is an ancestor in the component tree.'
        );

        // Restore console.error
        console.error = originalError;
    });
});
