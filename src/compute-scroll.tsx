import { LayoutRectangle } from 'react-native';
import { Insets, Align } from './config';

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
    const scrollViewHeight = scrollViewLayout.height;
    const childHeight = viewLayout.height;
    // layout measures are relative to window, so we make them relative to ScrollView instead
    const viewTopY = viewLayout.y - scrollViewLayout.y;
    const viewBottomY = viewTopY + childHeight;
    const computationData = {
        scrollViewHeight,
        scrollY,
        viewTopY,
        viewBottomY,
        insets
    };
    switch (align) {
        case 'auto':
            return computeScrollYAuto(computationData);
        case 'start':
            return computeScrollYTop(computationData);
        case 'end':
            return computeScrollYBottom(computationData);
        case 'center':
            return computeScrollYCenter(computationData);
        default:
            throw new Error(`align=${align} not supported`);
    }
};

export const computeScrollYAuto = (data: ComputationData): number => {
    const { scrollY } = data;
    const scrollYTop = computeScrollYTop(data);
    if (scrollY > scrollYTop) {
        return scrollYTop;
    }
    const scrollYBottom = computeScrollYBottom(data);
    if (scrollY < scrollYBottom) {
        return scrollYBottom;
    }
    return scrollY;
};

export const computeScrollYTop = ({ scrollY, viewTopY, insets }: ComputationData): number => {
    return scrollY + viewTopY - (insets.top || 0);
};

export const computeScrollYBottom = ({ scrollViewHeight, scrollY, viewBottomY, insets }: ComputationData): number => {
    return scrollY + viewBottomY - scrollViewHeight + (insets.bottom || 0);
};

export const computeScrollYCenter = (data: ComputationData): number => {
    return (computeScrollYTop(data) + computeScrollYBottom(data)) / 2;
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
    const scrollViewWidth = scrollViewLayout.width;
    const childWidth = viewLayout.width;
    // layout measures are relative to window, so we make them relative to ScrollView instead
    const viewLeftX = viewLayout.x - scrollViewLayout.x;
    const viewRightX = viewLeftX + childWidth;
    const computationData: ComputationDataX = {
        scrollViewWidth,
        scrollX,
        viewLeftX,
        viewRightX,
        insets
    };
    switch (align) {
        case 'auto':
            return computeScrollXAuto(computationData);
        case 'start':
            return computeScrollXLeft(computationData);
        case 'end':
            return computeScrollXRight(computationData);
        case 'center':
            return computeScrollXCenter(computationData);
        default:
            throw new Error(`align=${align} not supported for horizontal scrolling`);
    }
};

export const computeScrollXAuto = (data: ComputationDataX): number => {
    const { scrollX } = data;
    const scrollXLeft = computeScrollXLeft(data);
    if (scrollX > scrollXLeft) {
        return scrollXLeft;
    }
    const scrollXRight = computeScrollXRight(data);
    if (scrollX < scrollXRight) {
        return scrollXRight;
    }
    return scrollX;
};

export const computeScrollXLeft = ({ scrollX, viewLeftX, insets }: ComputationDataX): number => {
    return scrollX + viewLeftX - (insets.left || 0);
};

export const computeScrollXRight = ({ scrollViewWidth, scrollX, viewRightX, insets }: ComputationDataX): number => {
    return scrollX + viewRightX - scrollViewWidth + (insets.right || 0);
};

export const computeScrollXCenter = (data: ComputationDataX): number => {
    return (computeScrollXLeft(data) + computeScrollXRight(data)) / 2;
};
