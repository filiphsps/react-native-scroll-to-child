import { useContext } from 'react';

import Context from './context';

import type { ScrollIntoViewAPI } from './api';

function useScrollIntoViewContext(): ScrollIntoViewAPI {
    const value = useContext(Context);
    if (value === null) {
        throw new Error(
            'ScrollIntoView context is missing. Ensure your ScrollView is wrapped with wrapScrollView() and is an ancestor in the component tree.'
        );
    }
    return value;
}

export function useScrollIntoView(): ScrollIntoViewAPI['scrollIntoView'] {
    const { scrollIntoView } = useScrollIntoViewContext();
    return scrollIntoView;
}
