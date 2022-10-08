import React, { createContext } from 'react';
import { RootStore } from './rootStore';
import { SignalingModule } from './modules/signaling/SignalingModule';
import { RtcModule } from './modules/rtc/RtcModule';

export type RootContext = RootStore | null;

// DI
const signalingModule = new SignalingModule();
const rtcModule = new RtcModule(signalingModule);
const rootStore = new RootStore(signalingModule, rtcModule);
//

interface Props {
  children: JSX.Element;
}

const RootStoreContext = createContext<RootContext>(null);

export const RootStoreProvider: React.FC<Props> = ({ children }) => (
  <RootStoreContext.Provider value={rootStore}>
    {children}
  </RootStoreContext.Provider>
);

export default RootStoreContext;
