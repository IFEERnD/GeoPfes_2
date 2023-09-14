import React from 'react';
import {Root} from 'native-base';
import Navigation from './Navigation';
import {MenuProvider} from 'react-native-popup-menu';
import {enableLatestRenderer} from 'react-native-maps';

console.disableYellowBox = true;
const App = () => {
  enableLatestRenderer();
  return (
    <Root>
      <MenuProvider>
        <Navigation />
      </MenuProvider>
    </Root>
  );
};
export default App;
