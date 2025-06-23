import { findNodeHandle, UIManager } from 'react-native';

import type React from 'react';
import type { LayoutRectangle } from 'react-native';

type FindNodeHandleArg = null | number | React.Component<any, any> | React.ComponentClass<any>;

export const measureElement = (element: FindNodeHandleArg): Promise<LayoutRectangle> => {
    const node = findNodeHandle(element);
    if (!node) return Promise.reject(new Error('Unable to find node handle'));

    return new Promise<LayoutRectangle>((resolve) => {
        UIManager.measureInWindow(node, (x, y, width, height) => resolve({ x, y, width, height }));
    });
};

export const throttle = <T extends (...args: any[]) => void>(func: T, limit: number): T => {
    let inThrottle = false;
    return function (this: unknown, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    } as T;
};
