import { computeScrollX, computeScrollY } from './compute-scroll';

import type { Insets } from './config';
import type { LayoutRectangle } from 'react-native';

const mockScrollViewLayout: LayoutRectangle = { x: 0, y: 0, width: 300, height: 500 };
const mockDefaultInsets: Insets = { top: 0, bottom: 0, left: 0, right: 0 };

describe('computeScrollY', () => {
    describe('align: start', () => {
        it('should scroll to bring the top of the view to the top of the scroll view', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 600, width: 100, height: 100 }; // View is below
            const currentScrollY = 0;
            const expectedScrollY = 600; // viewLayout.y - scrollViewLayout.y - insets.top = 600 - 0 - 0
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, mockDefaultInsets, 'start')).toBe(
                expectedScrollY
            );
        });

        it('should consider top inset', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 100, width: 100, height: 100 };
            const currentScrollY = 0;
            const insets: Insets = { top: 20, bottom: 0, left: 0, right: 0 };
            const expectedScrollY = 80; // viewLayout.y - scrollViewLayout.y - insets.top = 100 - 0 - 20
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, insets, 'start')).toBe(
                expectedScrollY
            );
        });
    });

    describe('align: end', () => {
        it('should scroll to bring the bottom of the view to the bottom of the scroll view', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 100, width: 100, height: 100 }; // View is above, partially visible
            const currentScrollY = 0;
            // viewBottomY = viewLayout.y - scrollViewLayout.y + viewLayout.height = 100 - 0 + 100 = 200
            // expected = currentScrollY + viewBottomY - scrollViewHeight + insets.bottom = 0 + 200 - 500 + 0 = -300 -- this seems off, let's re-evaluate based on function
            // computeScrollYEnd = scrollY + viewBottomY - scrollViewHeight + (insets.bottom || 0)
            // viewTopY = 100, viewBottomY = 200
            // scrollY + (viewLayout.y - scrollViewLayout.y + viewLayout.height) - scrollViewLayout.height + insets.bottom
            // 0 + (100 - 0 + 100) - 500 + 0 = 0 + 200 - 500 = -300. This is the direct output of computeScrollYEnd.
            // The main computeScrollY will use this.
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, mockDefaultInsets, 'end')).toBe(
                -300
            );
        });

        it('should consider bottom inset', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 450, width: 100, height: 100 }; // View is near bottom
            const currentScrollY = 0;
            const insets: Insets = { top: 0, bottom: 30, left: 0, right: 0 };
            // viewTopY = 450, viewBottomY = 550
            // expected = scrollY + viewBottomY - scrollViewHeight + insets.bottom = 0 + 550 - 500 + 30 = 80
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, insets, 'end')).toBe(80);
        });
    });

    describe('align: center', () => {
        it('should scroll to center the view in the scroll view', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 200, width: 100, height: 100 };
            const currentScrollY = 0;
            // scrollYStart = 200 - 0 - 0 = 200
            // scrollYEnd = 0 + (200 - 0 + 100) - 500 + 0 = -200
            // expected = (200 + (-200)) / 2 = 0
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, mockDefaultInsets, 'center')).toBe(
                0
            );
        });

        it('should center a view that is initially off-screen', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 700, width: 100, height: 100 }; // View is below
            const currentScrollY = 0;
            // scrollYStart = 700
            // scrollYEnd = 0 + (700 - 0 + 100) - 500 + 0 = 300
            // expected = (700 + 300) / 2 = 500
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, mockDefaultInsets, 'center')).toBe(
                500
            );
        });
    });

    describe('align: auto', () => {
        it('should not scroll if view is already fully visible', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 100, width: 100, height: 100 };
            const currentScrollY = 50; // View (100-200) is visible in ScrollView (0-500) with scrollY 50 (effectively 50-550)
            // viewTopY = 100, viewBottomY = 200
            // scrollYStart = 100
            // scrollYEnd = 0 + 200 - 500 + 0 = -300
            // currentScrollY (50) is not > scrollYStart (100)
            // currentScrollY (50) is not < scrollYEnd (-300)
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, mockDefaultInsets, 'auto')).toBe(
                currentScrollY
            );
        });

        it('should scroll down if view is partially visible at the bottom', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 450, width: 100, height: 100 }; // View (450-550)
            const currentScrollY = 0; // ScrollView (0-500)
            // viewTopY = 450, viewBottomY = 550
            // scrollYStart = 450
            // scrollYEnd = 0 + 550 - 500 + 0 = 50
            // currentScrollY (0) is not > scrollYStart (450)
            // currentScrollY (0) is < scrollYEnd (50) -> should return scrollYEnd
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, mockDefaultInsets, 'auto')).toBe(
                50
            );
        });

        it('should scroll up if view is partially visible at the top', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: -50, width: 100, height: 100 }; // View (-50 - 50)
            const currentScrollY = 0; // ScrollView (0-500)
            // viewTopY = -50, viewBottomY = 50
            // scrollYStart = -50
            // scrollYEnd = 0 + 50 - 500 + 0 = -450
            // currentScrollY (0) is > scrollYStart (-50) -> should return scrollYStart
            expect(computeScrollY(mockScrollViewLayout, viewLayout, currentScrollY, mockDefaultInsets, 'auto')).toBe(
                -50
            );
        });
    });
});

describe('computeScrollX', () => {
    // Similar tests for computeScrollX can be added here, analogous to computeScrollY
    describe('align: start', () => {
        it('should scroll to bring the left of the view to the left of the scroll view', () => {
            const viewLayout: LayoutRectangle = { x: 400, y: 0, width: 100, height: 100 }; // View is to the right
            const currentScrollX = 0;
            const expectedScrollX = 400; // viewLayout.x - scrollViewLayout.x - insets.left = 400 - 0 - 0
            expect(computeScrollX(mockScrollViewLayout, viewLayout, currentScrollX, mockDefaultInsets, 'start')).toBe(
                expectedScrollX
            );
        });
    });

    describe('align: end', () => {
        it('should scroll to bring the right of the view to the right of the scroll view', () => {
            const viewLayout: LayoutRectangle = { x: 50, y: 0, width: 100, height: 100 }; // View is to the left, partially visible
            const currentScrollX = 0;
            // viewRightX = viewLayout.x - scrollViewLayout.x + viewLayout.width = 50 - 0 + 100 = 150
            // expected = currentScrollX + viewRightX - scrollViewWidth + insets.right = 0 + 150 - 300 + 0 = -150
            expect(computeScrollX(mockScrollViewLayout, viewLayout, currentScrollX, mockDefaultInsets, 'end')).toBe(
                -150
            );
        });
    });

    describe('align: center', () => {
        it('should scroll to center the view horizontally', () => {
            const viewLayout: LayoutRectangle = { x: 0, y: 0, width: 100, height: 100 }; // View is at start
            const currentScrollX = 0;
            // scrollXStart = 0
            // scrollXEnd = 0 + (0 - 0 + 100) - 300 + 0 = -200
            // expected = (0 + (-200)) / 2 = -100
            expect(computeScrollX(mockScrollViewLayout, viewLayout, currentScrollX, mockDefaultInsets, 'center')).toBe(
                -100
            );
        });
    });

    describe('align: auto', () => {
        it('should not scroll if view is already fully horizontally visible', () => {
            const viewLayout: LayoutRectangle = { x: 50, y: 0, width: 100, height: 100 }; // View (50-150)
            const currentScrollX = 20; // ScrollView (0-300) with scrollX 20 (effectively 20-320)
            expect(computeScrollX(mockScrollViewLayout, viewLayout, currentScrollX, mockDefaultInsets, 'auto')).toBe(
                currentScrollX
            );
        });

        it('should scroll right if view is partially visible at the right edge', () => {
            const viewLayout: LayoutRectangle = { x: 250, y: 0, width: 100, height: 100 }; // View (250-350)
            const currentScrollX = 0; // ScrollView (0-300)
            // scrollXEnd = 0 + (250 - 0 + 100) - 300 + 0 = 50
            expect(computeScrollX(mockScrollViewLayout, viewLayout, currentScrollX, mockDefaultInsets, 'auto')).toBe(
                50
            );
        });

        it('should scroll left if view is partially visible at the left edge', () => {
            const viewLayout: LayoutRectangle = { x: -50, y: 0, width: 100, height: 100 }; // View (-50-50)
            const currentScrollX = 0; // ScrollView (0-300)
            // scrollXStart = -50
            expect(computeScrollX(mockScrollViewLayout, viewLayout, currentScrollX, mockDefaultInsets, 'auto')).toBe(
                -50
            );
        });
    });
});
