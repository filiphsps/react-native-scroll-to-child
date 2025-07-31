import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';

import { findNodeHandle, UIManager } from 'react-native';

import { measureElement, throttle } from './utils';

jest.mock('react-native', () => ({
    findNodeHandle: jest.fn(),
    UIManager: {
        measureInWindow: jest.fn()
    }
}));

describe('measureElement', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should resolve with layout rectangle when node is found', async () => {
        const mockNode = 123;
        const mockLayout = { x: 0, y: 10, width: 100, height: 200 };

        (findNodeHandle as jest.Mock).mockReturnValue(mockNode);
        (UIManager.measureInWindow as jest.Mock).mockImplementation((_, callback) => {
            callback(mockLayout.x, mockLayout.y, mockLayout.width, mockLayout.height);
        });

        const result = await measureElement({} as any);
        expect(result).toEqual(mockLayout);
    });

    it('should reject when node is not found', async () => {
        (findNodeHandle as jest.Mock).mockReturnValue(null);
        await expect(measureElement({} as any)).rejects.toThrow('Unable to find node handle');
    });
});

describe('throttle', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should call function immediately first time', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not call function again within throttle period', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        throttledFn();
        throttledFn();

        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call function again after throttle period', () => {
        const mockFn = jest.fn();
        const throttledFn = throttle(mockFn, 100);

        throttledFn();
        jest.advanceTimersByTime(100);
        throttledFn();

        expect(mockFn).toHaveBeenCalledTimes(2);
    });
});
