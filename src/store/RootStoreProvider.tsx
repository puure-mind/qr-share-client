import React, { createContext } from 'react';
import { RootStore } from './rootStore';

const RootStoreContext = createContext<RootStore>(new RootStore());

interface Props {
  children: JSX.Element;
}

export const RootStoreProvider: React.FC<Props> = ({ children }) => (
  <RootStoreContext.Provider value={new RootStore()}>
    {children}
  </RootStoreContext.Provider>
);

export default RootStoreContext;
