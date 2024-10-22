import React, {createContext, useEffect, useRef} from 'react';
import {createStore} from './store';

const StoreContext = createContext<ReturnType<typeof createStore> | null>(null);

type AppStoreProviderProps = {
  children: React.ReactNode;
  initialGuid?: string;
};

export const AppStoreProvider: React.FC<AppStoreProviderProps> = ({
  children,
  initialGuid,
}) => {
  const storeRef = useRef<ReturnType<typeof createStore>>();
  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  useEffect(() => {
    if (initialGuid) {
      storeRef.current?.getState().initProject(initialGuid);
    }
  }, [initialGuid]);

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export {StoreContext};
