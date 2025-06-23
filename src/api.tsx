import { normalizeOptions } from './config';
import { throttle } from './utils';

import type { FullOptions, PartialOptions } from './config';
import type { ScrollView, View } from 'react-native';

type ScrollParams = { x: number; y: number; animated: boolean };

export const scrollIntoView = async (
    scrollView: ScrollView,
    view: View,
    scrollY: number,
    scrollX: number,
    options: PartialOptions
): Promise<void> => {
    if (!(scrollView as any) || !(view as any)) {
        throw new Error('ScrollView and target View must be provided');
    }

    const { align, animated, computeScrollY, computeScrollX, measureElement, insets } = normalizeOptions(options);

    try {
        const [scrollViewLayout, viewLayout] = await Promise.all([measureElement(scrollView), measureElement(view)]);

        const targetScrollY = computeScrollY(scrollViewLayout, viewLayout, scrollY, insets, align);
        const targetScrollX = computeScrollX(scrollViewLayout, viewLayout, scrollX, insets, align);
        const scrollParams: ScrollParams = { x: targetScrollX, y: targetScrollY, animated };

        const scrollResponder = scrollView.getScrollResponder();
        if ((scrollResponder as any).scrollResponderScrollTo) {
            scrollResponder.scrollResponderScrollTo(scrollParams);
        } else {
            scrollView.scrollTo(scrollParams);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to scroll into view: ${errorMessage}`);
    }
};

type GetScrollView = () => ScrollView;
type GetScrollY = () => number;
type GetScrollX = () => number;
type GetDefaultOptions = () => FullOptions;

export type ScrollIntoViewDependencies = {
    readonly getScrollView: GetScrollView;
    readonly getScrollY: GetScrollY;
    readonly getScrollX: GetScrollX;
    readonly getDefaultOptions: GetDefaultOptions;
};

export class ScrollIntoViewAPI {
    constructor(private readonly dependencies: ScrollIntoViewDependencies) {
        this.validateDependencies(dependencies);
    }

    private validateDependencies(deps: ScrollIntoViewDependencies): void {
        const requiredDepKeys: (keyof ScrollIntoViewDependencies)[] = [
            'getScrollView',
            'getScrollY',
            'getScrollX',
            'getDefaultOptions'
        ];
        for (const key of requiredDepKeys) {
            if (typeof deps[key] !== 'function') {
                throw new Error(`Dependency "${key}" must be a function.`);
            }
        }
    }

    private getNormalizedOptions = (options: PartialOptions = {}): FullOptions =>
        normalizeOptions(options, this.dependencies.getDefaultOptions());

    public scrollIntoView = (view: View, options?: PartialOptions): Promise<void> => {
        const normalizedOptions = this.getNormalizedOptions(options);
        return normalizedOptions.immediate
            ? this.scrollIntoViewImmediate(view, normalizedOptions)
            : this.scrollIntoViewThrottled(view, normalizedOptions);
    };

    private performScroll = (view: View, options: PartialOptions): Promise<void> => {
        return scrollIntoView(
            this.dependencies.getScrollView(),
            view,
            this.dependencies.getScrollY(),
            this.dependencies.getScrollX(),
            options
        );
    };

    private scrollIntoViewThrottled = throttle(this.performScroll, 16);

    private scrollIntoViewImmediate = this.performScroll;
}
