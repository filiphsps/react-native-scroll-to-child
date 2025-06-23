import { scrollIntoView as actualGlobalScrollIntoView, ScrollIntoViewAPI } from './api';
import * as apiModule from './api';
import * as config from './config';
import * as utils from './utils';

import type { ScrollIntoViewDependencies } from './api';
import type { LayoutRectangle, ScrollView, View } from 'react-native';

const mockForInternalGlobalCall = jest.fn();

jest.spyOn(apiModule, 'scrollIntoView').mockImplementation(mockForInternalGlobalCall);

const mockGetScrollView = jest.fn();
const mockGetScrollY = jest.fn();
const mockGetScrollX = jest.fn();
const mockGetDefaultOptions = jest.fn();
const mockMeasureElement = jest.fn();
const mockComputeScrollY = jest.fn();
const mockComputeScrollX = jest.fn();
const mockScrollToFn = jest.fn();
const mockScrollResponderScrollToFn = jest.fn();

interface MockScrollResponder {
    scrollResponderScrollTo: jest.Mock | null;
}

const mockGetScrollResponderFn = jest.fn<MockScrollResponder, []>(() => ({
    scrollResponderScrollTo: mockScrollResponderScrollToFn
}));

const mockScrollViewInstance = {
    scrollTo: mockScrollToFn,
    getScrollResponder: mockGetScrollResponderFn
} as any as ScrollView;
const mockViewInstance = {} as View;

const baseDefaultOptions: config.FullOptions = {
    align: 'auto',
    animated: true,
    immediate: false,
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
    measureElement: mockMeasureElement,
    computeScrollY: mockComputeScrollY,
    computeScrollX: mockComputeScrollX
};

jest.spyOn(config, 'normalizeOptions').mockImplementation((options, fallbackOptions) => {
    const effectiveFallback = fallbackOptions || baseDefaultOptions;
    return {
        ...effectiveFallback,
        ...options,
        insets: {
            ...effectiveFallback.insets,
            ...options?.insets
        },
        measureElement: mockMeasureElement,
        computeScrollY: mockComputeScrollY,
        computeScrollX: mockComputeScrollX
    };
});

jest.spyOn(utils, 'throttle').mockImplementation((fn) => fn as any);

const defaultMockApiDependencies: ScrollIntoViewDependencies = {
    getScrollView: mockGetScrollView,
    getScrollY: mockGetScrollY,
    getScrollX: mockGetScrollX,
    getDefaultOptions: mockGetDefaultOptions
};

beforeEach(() => {
    jest.clearAllMocks();

    mockGetScrollView.mockReturnValue(mockScrollViewInstance);
    mockGetScrollY.mockReturnValue(0);
    mockGetScrollX.mockReturnValue(0);
    mockGetDefaultOptions.mockReturnValue({ ...baseDefaultOptions, immediate: false });

    mockMeasureElement.mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 } as LayoutRectangle);
    mockComputeScrollY.mockReturnValue(100);
    mockComputeScrollX.mockReturnValue(50);
    mockForInternalGlobalCall.mockResolvedValue(undefined);

    mockGetScrollResponderFn.mockImplementation(() => ({
        scrollResponderScrollTo: mockScrollResponderScrollToFn
    }));
});

describe('ScrollIntoViewAPI', () => {
    let api: ScrollIntoViewAPI;

    beforeEach(() => {
        api = new ScrollIntoViewAPI(defaultMockApiDependencies);
    });

    describe('constructor', () => {
        it.each([
            ['getScrollView', 'Dependency "getScrollView" must be a function.'],
            ['getScrollY', 'Dependency "getScrollY" must be a function.'],
            ['getScrollX', 'Dependency "getScrollX" must be a function.'],
            ['getDefaultOptions', 'Dependency "getDefaultOptions" must be a function.']
        ])('should throw an error if %s is missing', (depKey, expectedMessage) => {
            const invalidDeps = { ...defaultMockApiDependencies, [depKey]: undefined } as any;
            expect(() => new ScrollIntoViewAPI(invalidDeps)).toThrow(expectedMessage);
        });

        it('should initialize with valid dependencies', () => {
            expect(() => new ScrollIntoViewAPI(defaultMockApiDependencies)).not.toThrow();
        });
    });

    describe('scrollIntoView method (dispatching)', () => {
        it('should call the (spied-upon and mocked) global scrollIntoView via immediate path when options.immediate is true', async () => {
            mockGetDefaultOptions.mockReturnValueOnce({ ...baseDefaultOptions, immediate: false });
            const callOptions = { immediate: true, align: 'center' as const };
            await api.scrollIntoView(mockViewInstance, callOptions);

            expect(mockForInternalGlobalCall).toHaveBeenCalledTimes(1);
            expect(mockForInternalGlobalCall).toHaveBeenCalledWith(
                mockScrollViewInstance,
                mockViewInstance,
                0,
                0,
                expect.objectContaining(callOptions)
            );
        });

        it('should call the (spied-upon and mocked) global scrollIntoView via throttled path when options.immediate is false', async () => {
            mockGetDefaultOptions.mockReturnValueOnce({ ...baseDefaultOptions, immediate: false });
            const callOptions = { immediate: false, align: 'start' as const };
            await api.scrollIntoView(mockViewInstance, callOptions);

            expect(mockForInternalGlobalCall).toHaveBeenCalledTimes(1);
            expect(mockForInternalGlobalCall).toHaveBeenCalledWith(
                mockScrollViewInstance,
                mockViewInstance,
                0,
                0,
                expect.objectContaining(callOptions)
            );
        });

        it('should call the (spied-upon and mocked) global scrollIntoView via throttled path when options.immediate is undefined (defaulting to false)', async () => {
            // mockGetDefaultOptions is already set to return immediate: false in the global beforeEach
            const callOptions = { align: 'end' as const }; // No immediate property
            await api.scrollIntoView(mockViewInstance, callOptions);

            expect(mockForInternalGlobalCall).toHaveBeenCalledTimes(1);
            expect(mockForInternalGlobalCall).toHaveBeenCalledWith(
                mockScrollViewInstance,
                mockViewInstance,
                0,
                0,
                expect.objectContaining({ ...callOptions, immediate: false })
            );
        });
    });
});

describe('global scrollIntoView function (actual implementation)', () => {
    beforeEach(() => {
        jest.restoreAllMocks(); // Restore original apiModule.scrollIntoView and config.normalizeOptions

        jest.spyOn(config, 'normalizeOptions').mockImplementation((options, fallbackOptions) => {
            const effectiveFallback = fallbackOptions || baseDefaultOptions;
            return {
                ...effectiveFallback,
                ...options,
                insets: {
                    ...effectiveFallback.insets,
                    ...options?.insets
                },
                measureElement: mockMeasureElement,
                computeScrollY: mockComputeScrollY,
                computeScrollX: mockComputeScrollX
            };
        });

        mockMeasureElement.mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 } as LayoutRectangle);
        mockComputeScrollY.mockReturnValue(150);
        mockComputeScrollX.mockReturnValue(75);
        mockGetScrollResponderFn.mockImplementation(() => ({
            scrollResponderScrollTo: mockScrollResponderScrollToFn
        }));
        mockScrollToFn.mockClear();
        mockScrollResponderScrollToFn.mockClear();
    });

    it('should measure scrollView and view', async () => {
        await actualGlobalScrollIntoView(mockScrollViewInstance, mockViewInstance, 0, 0, {});
        expect(mockMeasureElement).toHaveBeenCalledWith(mockScrollViewInstance);
        expect(mockMeasureElement).toHaveBeenCalledWith(mockViewInstance);
        expect(mockMeasureElement).toHaveBeenCalledTimes(2);
    });

    it('should compute new scroll positions using functions from normalized options', async () => {
        const scrollViewLayout = { x: 0, y: 0, width: 300, height: 500 };
        const viewLayout = { x: 10, y: 600, width: 50, height: 50 };
        mockMeasureElement.mockImplementation((el) =>
            Promise.resolve(el === mockScrollViewInstance ? scrollViewLayout : viewLayout)
        );
        const currentScrollY = 10;
        const currentScrollX = 5;
        const options = { align: 'start' as const, insets: { top: 10 } };

        await actualGlobalScrollIntoView(
            mockScrollViewInstance,
            mockViewInstance,
            currentScrollY,
            currentScrollX,
            options
        );

        expect(mockComputeScrollY).toHaveBeenCalledWith(
            scrollViewLayout,
            viewLayout,
            currentScrollY,
            expect.objectContaining(options.insets),
            options.align
        );
        expect(mockComputeScrollX).toHaveBeenCalledWith(
            scrollViewLayout,
            viewLayout,
            currentScrollX,
            expect.objectContaining(options.insets),
            options.align
        );
    });

    it('should call scrollResponder.scrollResponderScrollTo if available', async () => {
        const specificScrollResponderScrollTo = jest.fn();
        mockGetScrollResponderFn.mockReturnValueOnce({ scrollResponderScrollTo: specificScrollResponderScrollTo });

        await actualGlobalScrollIntoView(mockScrollViewInstance, mockViewInstance, 0, 0, { animated: true });

        expect(specificScrollResponderScrollTo).toHaveBeenCalledWith({ x: 75, y: 150, animated: true });
        expect(mockScrollToFn).not.toHaveBeenCalled();
    });

    it('should call scrollView.scrollTo if scrollResponder.scrollResponderScrollTo is not available', async () => {
        mockGetScrollResponderFn.mockReturnValueOnce({ scrollResponderScrollTo: null });

        await actualGlobalScrollIntoView(mockScrollViewInstance, mockViewInstance, 0, 0, { animated: false });
        expect(mockScrollToFn).toHaveBeenCalledWith({ x: 75, y: 150, animated: false });
    });

    it('should re-throw error if measuring fails, prepended with a message', async () => {
        mockMeasureElement.mockRejectedValue(new Error('Measurement failed'));
        await expect(actualGlobalScrollIntoView(mockScrollViewInstance, mockViewInstance, 0, 0, {})).rejects.toThrow(
            'Failed to scroll into view: Measurement failed'
        );
    });
});
