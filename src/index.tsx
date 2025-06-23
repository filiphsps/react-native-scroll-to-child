import { Container } from './container';
import { wrapScrollViewHOC } from './hoc';

import type { PartialHOCConfig } from './config';
import type { WrappableComponent } from './hoc';

export * from './hooks';

export const ScrollIntoView = Container;

export const wrapScrollView = (comp: WrappableComponent) => wrapScrollViewHOC(comp);

export const wrapScrollViewConfigured = (config?: PartialHOCConfig) => (comp: WrappableComponent) =>
    wrapScrollViewHOC(comp, config);
