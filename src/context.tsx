import React from 'react';
import { ScrollIntoViewAPI, ScrollIntoViewDependencies } from './api';

const Context = React.createContext<ScrollIntoViewAPI | null>(null);

export default Context;

export const APIConsumer = Context.Consumer;

export const ProvideAPI: React.FC<{ dependencies: ScrollIntoViewDependencies; children: React.ReactNode }> = ({ dependencies, children }) => {
    const api = React.useMemo(() => new ScrollIntoViewAPI(dependencies), [dependencies]);
    return <Context.Provider value={api}>{children}</Context.Provider>;
};
