import { Container } from './container';
import { wrapScrollViewHOC } from './hoc';

import type { PartialHOCConfig } from './config';
import type { WrappableScrollView } from './hoc';

export * from './hooks';

export const ScrollIntoView = Container;

export const wrapScrollView = (comp: WrappableScrollView, config?: PartialHOCConfig) => wrapScrollViewHOC(comp, config);
