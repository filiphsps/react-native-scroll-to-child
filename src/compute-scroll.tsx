import type { Align, Insets } from './config';
import type { LayoutRectangle } from 'react-native';

type ComputationData = {
    scrollViewHeight: number;
    scrollY: number;
    viewTopY: number;
    viewBottomY: number;
    insets: Insets;
};

export const computeScrollY = (
    scrollViewLayout: LayoutRectangle,
    viewLayout: LayoutRectangle,
    scrollY: number,
    insets: Insets,
    align: Align
) => {
    const { height: scrollViewHeight, y: scrollViewY } = scrollViewLayout;
    const { height: childHeight, y: viewY } = viewLayout;

    const viewTopY = viewY - scrollViewY;
    const viewBottomY = viewTopY + childHeight;

    const computationData = { scrollViewHeight, scrollY, viewTopY, viewBottomY, insets };

    const computeFn = alignmentsY[align];
    if (!(computeFn as any)) throw new Error(`align=${align} not supported`);

    return computeFn(computationData);
};

export const computeScrollYAuto = (data: ComputationData): number => {
    const { scrollY } = data;
    const scrollYTop = computeScrollYStart(data);
    if (scrollY > scrollYTop) {
        return scrollYTop;
    }
    const scrollYBottom = computeScrollYEnd(data);
    if (scrollY < scrollYBottom) {
        return scrollYBottom;
    }
    return scrollY;
};

export const computeScrollYStart = ({ scrollY, viewTopY, insets }: ComputationData): number => {
    return scrollY + viewTopY - (insets.top || 0);
};

export const computeScrollYEnd = ({ scrollViewHeight, scrollY, viewBottomY, insets }: ComputationData): number => {
    return scrollY + viewBottomY - scrollViewHeight + (insets.bottom || 0);
};

export const computeScrollYCenter = (data: ComputationData): number => {
    return (computeScrollYStart(data) + computeScrollYEnd(data)) / 2;
};

const alignmentsY: Record<Align, (data: ComputationData) => number> = {
    auto: computeScrollYAuto,
    start: computeScrollYStart,
    end: computeScrollYEnd,
    center: computeScrollYCenter
};

type ComputationDataX = {
    scrollViewWidth: number;
    scrollX: number;
    viewLeftX: number;
    viewRightX: number;
    insets: Insets;
};

export const computeScrollX = (
    scrollViewLayout: LayoutRectangle,
    viewLayout: LayoutRectangle,
    scrollX: number,
    insets: Insets,
    align: Align
): number => {
    const { width: scrollViewWidth, x: scrollViewX } = scrollViewLayout;
    const { width: childWidth, x: viewX } = viewLayout;

    const viewLeftX = viewX - scrollViewX;
    const viewRightX = viewLeftX + childWidth;

    const computationData: ComputationDataX = { scrollViewWidth, scrollX, viewLeftX, viewRightX, insets };

    const computeFn = alignmentsX[align];
    if (!(computeFn as any)) throw new Error(`align=${align} not supported for horizontal scrolling`);

    return computeFn(computationData);
};

export const computeScrollXAuto = (data: ComputationDataX): number => {
    const { scrollX } = data;
    const scrollXLeft = computeScrollXStart(data);
    if (scrollX > scrollXLeft) {
        return scrollXLeft;
    }
    const scrollXRight = computeScrollXEnd(data);
    if (scrollX < scrollXRight) {
        return scrollXRight;
    }
    return scrollX;
};

export const computeScrollXStart = ({ scrollX, viewLeftX, insets }: ComputationDataX): number => {
    return scrollX + viewLeftX - (insets.left || 0);
};

export const computeScrollXEnd = ({ scrollViewWidth, scrollX, viewRightX, insets }: ComputationDataX): number => {
    return scrollX + viewRightX - scrollViewWidth + (insets.right || 0);
};

export const computeScrollXCenter = (data: ComputationDataX): number => {
    return (computeScrollXStart(data) + computeScrollXEnd(data)) / 2;
};

const alignmentsX: Record<Align, (data: ComputationDataX) => number> = {
    auto: computeScrollXAuto,
    start: computeScrollXStart,
    end: computeScrollXEnd,
    center: computeScrollXCenter
};
