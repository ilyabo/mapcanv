import React from 'react';
import {TooltipProvider} from './components/ui/tooltip';
import {MapContainer} from './map/map-container';
import {AppStoreProvider} from './store/AppStoreProvider';
import {isValudGuid} from './store/utils';

const AppContainer: React.FC = () => {
  const guid = location.pathname.split('/').pop();
  const initialGuid = isValudGuid(guid) ? guid : undefined;

  return (
    <AppStoreProvider initialGuid={initialGuid}>
      <TooltipProvider>
        <MapContainer />
      </TooltipProvider>
    </AppStoreProvider>
  );
};

export default AppContainer;
