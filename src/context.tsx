import React from 'react';

import { ScrollIntoViewAPI } from './api';

import type { ScrollIntoViewDependencies } from './api';

const Context = React.createContext<ScrollIntoViewAPI | null>(null);

export default Context;

export const APIConsumer = Context.Consumer;

interface ProvideAPIProps {
    dependencies: ScrollIntoViewDependencies;
    children: React.ReactNode;
}

export const ProvideAPI: React.FC<ProvideAPIProps> = ({ dependencies, children }) => {
    const api = React.useMemo(() => new ScrollIntoViewAPI(dependencies), [dependencies]);
    return <Context.Provider value={api}>{children}</Context.Provider>;
};
